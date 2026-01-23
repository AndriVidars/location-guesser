import { useState, useEffect } from 'react';
import { getDistance } from 'geolib';
import StreetView from "@/components/maps/StreetView";
import GuessMap from "@/components/maps/GuessMap";
import type { Game, GameRound, GameRoundPlayer } from '@/lib/types/game';
import { calculateScore } from '@/lib/utils/game';

interface GameViewProps {
    game: Game;
    round: GameRound | null;
    roundPlayer: GameRoundPlayer | null;
}

export const GameView = ({ game, round, roundPlayer }: GameViewProps) => {
    const [timeLeft, setTimeLeft] = useState(game.time_limit);

    useEffect(() => {
        if (!round) return;

        setTimeLeft(game.time_limit);

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [round, game.time_limit]);

    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-sans uppercase tracking-widest text-white">
            {round && (!roundPlayer || (!roundPlayer.guess_latitude && !roundPlayer.guess_longitude)) ? (
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
                            <GuessMap onGuess={(lat, lng) => {
                                if (round) {
                                    const distance = getDistance(
                                        { latitude: lat, longitude: lng },
                                        { latitude: round.sampled_latitude, longitude: round.sampled_longitude }
                                    );
                                    const distanceKm = distance / 1000;
                                    const score = calculateScore(game, distanceKm);
                                    console.log(`City: ${round.city_name}`);
                                    console.log(`Distance: ${distanceKm.toFixed(2)} km`);
                                    console.log(`Score: ${score}`);
                                }
                            }} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center min-h-screen text-[10px]">
                    Loading Round...
                </div>
            )}
        </div>
    );
};
