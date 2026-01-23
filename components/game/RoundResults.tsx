import { useMemo } from 'react';
import type { GamePlayer, GameRoundPlayer, GameRound } from '@/lib/types/game';
import { Logo } from '@/components/common/Logo';
import ResultMap from '../maps/ResultMap';

interface RoundResultsProps {
    players: GamePlayer[];
    round: GameRound | null;
    roundPlayers: GameRoundPlayer[];
    isHost: boolean;
    onNextRound: () => void;
    loading: boolean;
    currentPlayerId: string;
    currentRound: number;
    totalRounds: number;
    onFinishGame: () => void;
}

interface PlayerScore {
    playerId: string;
    name: string;
    roundScore: number | null;
    totalScore: number;
}

export const RoundResults = ({
    players,
    round,
    roundPlayers,
    isHost,
    onNextRound,
    loading,
    currentPlayerId,
    currentRound,
    totalRounds,
    onFinishGame
}: RoundResultsProps) => {
    // Combine player data with round scores
    const playerScores = useMemo<PlayerScore[]>(() => {
        const scores = players.map(player => {
            const roundPlayer = roundPlayers.find(rp => rp.player_id === player.player_id);
            return {
                playerId: player.player_id,
                name: player.name,
                roundScore: roundPlayer?.score ?? null,
                totalScore: player.score
            };
        });

        // Sort by total score (descending)
        return scores.sort((a, b) => b.totalScore - a.totalScore);
    }, [players, roundPlayers]);

    const allPlayersFinished = playerScores.every(p => p.roundScore !== null);

    // Prepare map data
    const mapData = useMemo(() => {
        if (!round) return null;

        const correctLocation = {
            lat: round.sampled_latitude,
            lng: round.sampled_longitude
        };

        const guesses = roundPlayers
            .map(rp => {
                const player = players.find(p => p.player_id === rp.player_id);
                // null distance is fine, do not default to 0
                const distanceKm = rp.distance;

                return {
                    playerId: rp.player_id,
                    name: player?.name || 'Unknown',
                    lat: rp.guess_latitude ?? null, // Use null if undefined/null
                    lng: rp.guess_longitude ?? null,
                    distance: distanceKm, // Pass null if null
                    color: player?.player_id === currentPlayerId ? '#f6573b' : '#a1a1aa'
                };
            });

        return { correctLocation, guesses };
    }, [round, roundPlayers, players, currentPlayerId]);

    const isLastRound = currentRound >= totalRounds;

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-zinc-900 font-sans uppercase tracking-widest text-xs relative p-8">
            {/* Same Logo / Map etc ... I'll assume replace_file_content works on the Return logic or I target specifically the button area if I can, but props needs destructuring update first */}
            <div className="absolute top-6 left-6">
                <Logo />
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Map Section */}
                <div className="h-[400px] w-full bg-zinc-100 rounded-lg shadow-inner">
                    {mapData && (
                        <ResultMap
                            correctLocation={mapData.correctLocation}
                            guesses={mapData.guesses}
                        />
                    )}
                </div>

                <div className="space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="text-[10px] text-zinc-400">
                            Round {currentRound} of {totalRounds}
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {allPlayersFinished ? 'Scoreboard' : 'Waiting for Players'}
                        </h2>
                        <div className="h-px w-12 bg-zinc-900 mx-auto" />
                    </div>

                    {/* Scores List */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] text-zinc-500 border-b border-zinc-100 pb-2">
                            <div className="flex gap-4">
                                <span className="w-4">#</span>
                                <span>Player</span>
                            </div>
                            <span>Score</span>
                        </div>
                        <div className="space-y-3">
                            {playerScores.map((player, index) => {
                                const playerGuess = mapData?.guesses.find(g => g.playerId === player.playerId);
                                return (
                                    <div
                                        key={player.playerId}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-4 font-bold text-zinc-400">{index + 1}</span>
                                            <div className="flex flex-col items-start">
                                                <span className={`text-sm ${player.playerId === currentPlayerId ? 'font-bold' : ''}`}>
                                                    {player.name}
                                                </span>
                                                {/* Show distance in list if available */}
                                                {playerGuess?.distance != null ? (
                                                    <span className="text-[10px] text-zinc-400 lowercase tracking-normal">
                                                        {Math.round(playerGuess.distance)} km
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-zinc-400 lowercase tracking-normal italic">
                                                        no guess
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold">
                                                    {player.totalScore.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-zinc-400">/ {totalRounds * 100}</span>
                                            </div>
                                            {player.roundScore !== null ? (
                                                <span className="text-[10px] text-zinc-500">
                                                    +{player.roundScore.toLocaleString()} <span className="opacity-50">(max 100)</span>
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-zinc-400 animate-pulse">
                                                    ...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Round Button */}
                    {allPlayersFinished && isHost && (
                        <div className="pt-4">
                            <button
                                onClick={isLastRound ? onFinishGame : onNextRound}
                                disabled={loading}
                                className="w-full py-3 bg-zinc-900 text-white font-bold
                                         hover:bg-zinc-800 transition-all duration-200 
                                         cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {loading ? 'Processing...' : (isLastRound ? 'Finish Game' : 'Next Round')}
                            </button>
                        </div>
                    )}

                    {/* Waiting Message for Non-Host */}
                    {allPlayersFinished && !isHost && (
                        <div className="text-center pt-4">
                            <p className="text-[10px] text-zinc-500 animate-pulse">
                                Waiting for host to start next round...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
