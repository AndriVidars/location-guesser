import StreetView from "@/components/maps/StreetView";
import GuessMap from "@/components/maps/GuessMap";
import type { Game, GameRound } from '@/lib/types/game';

interface GameViewProps {
    game: Game;
    round: GameRound | null;
}

export const GameView = ({ game, round }: GameViewProps) => {
    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-sans uppercase tracking-widest text-white">
            {round ? (
                <>
                    <div className="absolute inset-0">
                        <StreetView imageId={round.mapillary_image_id} />
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute top-8 left-8 z-10 space-y-2 pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm p-3 border border-white/10 w-fit">
                            <p className="text-[10px] text-zinc-400 mb-1 leading-none">Round</p>
                            <p className="text-sm font-bold leading-none">{game.current_round} / {game.num_rounds}</p>
                        </div>
                    </div>

                    {/* Guess Map */}
                    <div className="absolute bottom-8 right-14 z-20 group">
                        <div className="h-40 w-52 transition-all duration-300 group-hover:h-[400px] group-hover:w-[600px]">
                            <GuessMap onGuess={(lat, lng) => {
                                console.log(lat, lng);
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
