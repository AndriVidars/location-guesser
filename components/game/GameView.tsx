import { useState, useEffect } from 'react';
import StreetView from "@/components/maps/StreetView";
import GuessMap from "@/components/maps/GuessMap";
import { RoundResults } from "@/components/game/RoundResults";
import type { Game, GameRound, GameRoundPlayer, GamePlayer } from '@/lib/types/game';
import { submitGuess, finishGame, submitNoGuess } from '@/lib/server/game';
import { GameFinished } from './GameFinished';

interface GameViewProps {
    game: Game;
    round: GameRound | null;
    roundPlayer: GameRoundPlayer | null;
    player: GamePlayer;
    players: GamePlayer[];
    roundPlayers: GameRoundPlayer[];
    onNextRound: () => void;
    loading: boolean;
}

export const GameView = ({ game, round, roundPlayer, player, players, roundPlayers, onNextRound, loading }: GameViewProps) => {
    const [timeLeft, setTimeLeft] = useState(game.time_limit);

    useEffect(() => {
        if (!round) return;
        // Don't start timer if player already submitted - safeguard
        if (roundPlayer?.score !== null) return;

        setTimeLeft(game.time_limit);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitNoGuess(game.id, round.id, player.player_id).catch(console.error);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [round, game.time_limit, roundPlayer?.score]);

    const handleFinish = async () => {
        if (!player.is_host) return;
        await finishGame(game.id, player.player_id);
    };

    if (!game.is_active && game.current_round > 0) {
        return (
            <GameFinished
                gameId={game.id}
                playerId={player.player_id}
                players={players}
            />
        );
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-sans text-white">
            {round && roundPlayer && roundPlayer.score === null ? (
                <>
                    <div className="absolute inset-0">
                        <StreetView imageId={round.mapillary_image_id} />
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute top-8 left-8 z-10 space-y-2 pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm p-3 border border-white/10 w-fit">
                            <p className="text-[10px] text-zinc-300 mb-1 leading-none">Round</p>
                            <p className="text-sm font-bold leading-none">{game.current_round} / {game.num_rounds}</p>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="absolute top-8 right-8 z-10 pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm p-3 border border-white/10 w-20 text-center">
                            <p className="text-[10px] text-zinc-300 mb-1 leading-none">Time</p>
                            <p className={`text-sm font-bold leading-none ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </p>
                        </div>
                    </div>

                    {/* Guess Map */}
                    <div className="absolute bottom-8 right-14 z-20 group">
                        <div className="h-40 w-52 transition-all duration-300 group-hover:h-[400px] group-hover:w-[600px]">
                            <GuessMap onGuess={async (lat, lng) => {
                                if (round) {
                                    await submitGuess(game.id, round.id, player.player_id, lat, lng);
                                }
                            }} />
                        </div>
                    </div>
                </>
            ) : round && roundPlayer && roundPlayer.score !== null ? (
                <RoundResults
                    players={players}
                    round={round}
                    roundPlayers={roundPlayers}
                    isHost={player.is_host}
                    onNextRound={onNextRound}
                    onFinishGame={handleFinish}
                    loading={loading}
                    currentPlayerId={player.player_id}
                    currentRound={game.current_round}
                    totalRounds={game.num_rounds}
                />
            ) : (
                <div className="flex items-center justify-center min-h-screen text-[10px]">
                    Loading Round...
                </div>
            )}
        </div>
    );
};
