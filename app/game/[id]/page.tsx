'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { startGame } from '@/lib/server/game';
import type { Game, GamePlayer, GameRound, GameRoundPlayer } from '@/lib/types/game';
import { Lobby } from '@/components/game/Lobby';
import { GameView } from '@/components/game/GameView';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: gameId } = use(params);
    const router = useRouter();
    const [game, setGame] = useState<Game | null>(null);
    const [player, setPlayer] = useState<GamePlayer | null>(null);
    const [players, setPlayers] = useState<GamePlayer[]>([]);
    const [round, setRound] = useState<GameRound | null>(null);
    const [roundPlayer, setRoundPlayer] = useState<GameRoundPlayer | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const gameRef = useRef(game);
    useEffect(() => { gameRef.current = game; }, [game]); // necessary?

    // Safeguard against accidental exit
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (gameRef.current?.is_active) {
                e.preventDefault();
            }
        };

        const handlePopState = (e: PopStateEvent) => {
            if (gameRef.current?.is_active) {
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Initial trap
        window.history.pushState(null, '', window.location.href);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('game_player');
        if (!stored) {
            router.push('/');
            return;
        }
        const currentPlayer = JSON.parse(stored) as GamePlayer;
        setPlayer(currentPlayer);

        // Initial fetch
        const fetchGameState = async () => {
            const { data: g } = await supabaseClient.from('games').select('*').eq('id', gameId).single();
            if (!g) {
                router.push('/');
                return;
            }
            setGame(g);

            const { data: pList } = await supabaseClient.from('game_players').select('*').eq('game_id', gameId);
            if (pList) setPlayers(pList);

            if (g.current_round > 0) {
                const { data: r } = await supabaseClient
                    .from('game_rounds')
                    .select('*')
                    .eq('game_id', gameId)
                    .eq('round_number', g.current_round)
                    .eq('is_active', true)
                    .single();

                if (r) {
                    setRound(r);
                    const { data: rp } = await supabaseClient
                        .from('game_round_players')
                        .select('*')
                        .eq('game_round_id', r.id)
                        .eq('player_id', currentPlayer.player_id)
                        .single();
                    if (rp) setRoundPlayer(rp);
                }
            }

            setLoading(false);
        };

        fetchGameState();

        // Realtime subscription
        const channel = supabaseClient
            .channel(`game:${gameId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
                (payload) => setGame(payload.new as Game))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_rounds', filter: `game_id=eq.${gameId}` },
                (payload) => {
                    setRound(payload.new as GameRound);
                    setRoundPlayer(null); // Clear previous guess for the new round
                })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
                async () => {
                    const { data: pList } = await supabaseClient.from('game_players').select('*').eq('game_id', gameId);
                    if (pList) setPlayers(pList);
                })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'game_round_players',
                filter: `player_id=eq.${currentPlayer.player_id}`
            },
                (payload) => {
                    setRoundPlayer(payload.new as GameRoundPlayer);
                })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [gameId, router]);

    const handleCopy = () => {
        if (!game?.invite_code) return;
        navigator.clipboard.writeText(game.invite_code);
        setCopied(true);
    };

    const handleStart = async () => {
        if (!player?.is_host) return;
        setLoading(true);
        const newRound = await startGame(gameId, player.player_id);

        if (newRound) {
            // Manually fetch the updated game state to ensure immediate transition for the host
            const { data: updatedGame } = await supabaseClient
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single();

            if (updatedGame) setGame(updatedGame);
            setRound(newRound);
        }
        setLoading(false);
    };

    if (loading && !game) {
        return (
            <div className="flex items-center justify-center min-h-screen text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Connecting...
            </div>
        );
    }

    if (game && game.current_round === 0) {
        return (
            <Lobby
                game={game}
                players={players}
                isHost={player?.is_host || false}
                inviteCode={game.invite_code}
                onStartGame={handleStart}
                onCopyInvite={handleCopy}
                copied={copied}
                loading={loading}
            />
        );
    }

    return <GameView game={game!} round={round} roundPlayer={roundPlayer} player={player!} />;
}
