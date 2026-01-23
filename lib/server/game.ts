'use server'

import { supabaseServer } from "../supabase";
import type { Game, GamePlayer, GameRound, GameRoundPlayer } from "../types/game";
import { generateInviteCode } from "../utils/game";
import { getRandomCity, getContinentArea } from "./geo";
import { getNearestImageId } from "./mapillary";
import { getDistance } from 'geolib';
import { calculateScore } from '../utils/game';

export async function createGame(
    playerName: string,
    numRounds: number,
    timeLimit: number,
    continentCode: string | null,
): Promise<{ game: Game; player: GamePlayer } | null> {
    const inviteCode = generateInviteCode();
    const { data: gameData, error } = await supabaseServer.from('games').insert({
        invite_code: inviteCode,
        num_rounds: numRounds,
        time_limit: timeLimit,
        continent_code: continentCode,
    }).select().single();

    if (error) {
        console.error('Error creating game:', error);
        return null;
    }

    gameData.game_map_area_km2 = continentCode ? await getContinentArea(continentCode) : 149e6; // default use earths total land area

    const { data: playerData, error: playerError } = await supabaseServer.from('game_players').insert({
        game_id: gameData.id,
        player_id: crypto.randomUUID(),
        name: playerName,
        is_host: true
    }).select().single();

    if (playerError) {
        console.error('Error creating game player:', playerError);
        return null;
    }

    return { game: gameData, player: playerData };
}

export async function joinGame(
    inviteCode: string,
    playerName: string
): Promise<{ game: Game; player: GamePlayer } | null> {
    const { data: gameData, error: gameError } = await supabaseServer
        .from('games')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('is_active', true)
        .single();

    if (gameError || !gameData) {
        console.error('Error finding game or game not found:', gameError);
        return null;
    }

    const { data: playerData, error: playerError } = await supabaseServer
        .from('game_players')
        .insert({
            game_id: gameData.id,
            player_id: crypto.randomUUID(),
            name: playerName,
            is_host: false
        })
        .select()
        .single();

    if (playerError) {
        console.error('Error joining game:', playerError);
        return null;
    }

    return { game: gameData, player: playerData };
}

export async function startGame(
    gameId: string,
    playerId: string
): Promise<GameRound | null> {
    const { data: game, error } = await supabaseServer
        .from('games')
        .select('current_round')
        .eq('id', gameId)
        .single();

    if (error || !game) {
        console.error('Error starting game:', error);
        return null;
    }

    if (game.current_round !== 0) {
        console.error('Game has already started');
        return null;
    }

    return nextRound(gameId, playerId);
}

export async function nextRound(
    gameId: string,
    playerId: string
): Promise<GameRound | null> {
    // 1. Verify that the player is the host of the game
    const { data: player, error: playerError } = await supabaseServer
        .from('game_players')
        .select('is_host')
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .single();

    if (playerError || !player?.is_host) {
        console.error('Unauthorized: Only the host can start the next round');
        return null;
    }

    // 2. Get game details to know constraints and current state
    const { data: game, error: gameError } = await supabaseServer
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

    if (gameError || !game) {
        console.error('Error fetching game details:', gameError);
        return null;
    }

    if (game.current_round >= game.num_rounds) {
        console.error('Game has already reached the maximum number of rounds');
        return null;
    }

    // 3. Find a city with Mapillary coverage
    let cityData = null;
    let imageId = null;

    while (!imageId) {
        cityData = await getRandomCity(game.continent_code, game.country_code);
        if (cityData) {
            //console.log('Found city:', cityData);
            imageId = await getNearestImageId(cityData.latitude, cityData.longitude);
        }
    }

    if (!cityData || !imageId) {
        console.error('Failed to find a suitable location with Mapillary imagery');
        return null;
    }

    // 4. Create the new round and update the game's current_round
    const nextRoundNumber = game.current_round + 1;

    // We deactivate the previous round for this game
    if (game.current_round > 0) {
        await supabaseServer
            .from('game_rounds')
            .update({ is_active: false })
            .eq('game_id', gameId)
            .eq('round_number', game.current_round);
    }

    const { data: roundData, error: roundError } = await supabaseServer
        .from('game_rounds')
        .insert({
            game_id: gameId,
            round_number: nextRoundNumber,
            city_name: cityData.city_name,
            sampled_latitude: cityData.latitude,
            sampled_longitude: cityData.longitude,
            mapillary_image_id: imageId,
            is_active: true
        })
        .select()
        .single();

    if (roundError) {
        console.error('Error creating new round:', roundError);
        return null;
    }

    // 5. Initialize game_round_players for all players in the game
    const { data: allPlayers, error: playersError } = await supabaseServer
        .from('game_players')
        .select('player_id')
        .eq('game_id', gameId);

    if (playersError || !allPlayers) {
        console.error('Error fetching players:', playersError);
    } else {
        // Insert initial records for all players
        const playerRecords = allPlayers.map((p: { player_id: string }) => ({
            game_round_id: roundData.id,
            player_id: p.player_id,
            score: null,
            guess_latitude: null,
            guess_longitude: null
        }));

        const { error: insertError } = await supabaseServer
            .from('game_round_players')
            .insert(playerRecords);

        if (insertError) {
            console.error('Error initializing game_round_players:', insertError);
        }
    }

    // 6. Update the game state (this triggers the update for other players)
    const { error: updateError } = await supabaseServer
        .from('games')
        .update({ current_round: nextRoundNumber })
        .eq('id', gameId);

    if (updateError) {
        console.error('Error updating game state:', updateError);
    }

    return roundData;
}

export async function submitGuess(
    gameId: string,
    roundId: string,
    playerId: string,
    guessLat: number,
    guessLng: number
): Promise<{ success: true; score: number } | { success: false; error: string }> {
    // Fetch game and round data
    const { data: game, error: gameError } = await supabaseServer
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

    if (gameError || !game) {
        return { success: false, error: 'Game not found' };
    }

    const { data: round, error: roundError } = await supabaseServer
        .from('game_rounds')
        .select('*')
        .eq('id', roundId)
        .single();

    if (roundError || !round) {
        return { success: false, error: 'Round not found' };
    }

    // Calculate distance in meters, then convert to km
    const distanceMeters = getDistance(
        { latitude: guessLat, longitude: guessLng },
        { latitude: round.sampled_latitude, longitude: round.sampled_longitude }
    );
    const distanceKm = distanceMeters / 1000;

    // Calculate score
    const score = calculateScore(game, distanceKm);
    console.log('Score:', score);

    // Upsert the game_round_player record
    const { error: upsertError } = await supabaseServer
        .from('game_round_players')
        .update({
            guess_latitude: guessLat,
            guess_longitude: guessLng,
            score: score
        })
        .eq('game_round_id', roundId)
        .eq('player_id', playerId);

    if (upsertError) {
        console.error('Error updating game round player:', upsertError);
        return { success: false, error: 'Failed to save guess' };
    }

    return { success: true, score };
}
