'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import GameSummaryMap from '@/components/maps/GameSummaryMap';
import { getPlayerGuesses } from '@/lib/server/game';
import type { GamePlayer } from '@/lib/types/game';

interface GameFinishedProps {
    gameId: string;
    playerId: string;
    players: GamePlayer[];
}

export const GameFinished = ({ gameId, playerId, players }: GameFinishedProps) => {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const data = await getPlayerGuesses(gameId, playerId);
            setHistory(data);
            setLoading(false);
        };
        fetchHistory();
    }, [gameId, playerId]);

    // Sort players by total score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    // Parse history for map
    const mapRounds = history.map(h => ({
        roundNumber: h.round.round_number,
        correct: {
            lat: h.round.sampled_latitude,
            lng: h.round.sampled_longitude
        },
        guess: {
            lat: h.guess_latitude,
            lng: h.guess_longitude
        },
        distance: h.distance
    }));

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-zinc-900 font-sans relative p-8">
            <div className="absolute top-6 left-6">
                <Logo />
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-16 md:mt-0">

                {/* Map Section - Same style as RoundResults map container */}
                <div className="h-[400px] w-full bg-zinc-100 rounded-lg shadow-inner relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 animate-pulse">
                            Loading Game History...
                        </div>
                    ) : (
                        <GameSummaryMap rounds={mapRounds} />
                    )}
                </div>

                {/* Scoreboard Section */}
                <div className="space-y-12">
                    <div className="text-center space-y-2">

                        <h2 className="text-xl font-bold tracking-tight">
                            Final Standings
                        </h2>
                        <div className="h-px w-12 bg-zinc-900 mx-auto" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-[11px] text-zinc-500 border-b border-zinc-300 pb-2">
                            <div className="flex gap-4">
                                <span className="w-4">#</span>
                                <span>Player</span>
                            </div>
                            <span>Total Score</span>
                        </div>
                        <div className="space-y-3">
                            {sortedPlayers.map((player, index) => (
                                <div
                                    key={player.player_id}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`w-4 font-bold ${index === 0 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex flex-col items-start">
                                            <span className={`text-sm ${player.player_id === playerId ? 'font-bold' : ''} ${index === 0 ? 'text-zinc-900' : 'text-zinc-600'}`}>
                                                {player.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold">{player.score.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 bg-zinc-900 text-white font-bold
                                 hover:bg-zinc-800 transition-all duration-200 
                                 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl"
                    >
                        Exit Game
                    </button>
                </div>
            </div>
        </div>
    );
};
