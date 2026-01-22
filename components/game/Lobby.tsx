import { Copy, Check } from 'lucide-react';
import type { Game, GamePlayer } from '@/lib/types/game';
import { Logo } from '@/components/common/Logo';

interface LobbyProps {
    game: Game;
    players: GamePlayer[];
    isHost: boolean;
    inviteCode: string;
    onStartGame: () => void;
    onCopyInvite: () => void;
    copied: boolean;
    loading: boolean;
}

export const Lobby = ({
    game,
    players,
    isHost,
    inviteCode,
    onStartGame,
    onCopyInvite,
    copied,
    loading
}: LobbyProps) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-xs uppercase tracking-widest bg-white text-zinc-900 relative">
            <div className="absolute top-6 left-6">
                <Logo />
            </div>
            <div className="w-64 space-y-12">
                <header className="space-y-4 text-center">
                    <h1 className="text-xl font-bold tracking-tight">Game Lobby</h1>
                    <div className="flex flex-col items-center gap-2 pt-4">
                        <p className="text-[10px] text-zinc-400 uppercase">Invite Code</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-[0.2em]">{inviteCode}</span>
                            <button
                                onClick={onCopyInvite}
                                className="p-1 hover:bg-zinc-100 transition-colors cursor-pointer"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="space-y-4 border-y border-zinc-100 py-8">
                    <div className="space-y-2">
                        <p className="text-zinc-400 text-[10px] mb-4">Players</p>
                        <div className="space-y-2">
                            {players.map(p => (
                                <div key={p.player_id} className="flex justify-between items-center">
                                    <span className="normal-case">{p.name}</span>
                                    {p.is_host && <span className="text-[10px] text-zinc-400 border border-zinc-100 px-1">Host</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-b border-zinc-100 pb-8">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Rounds</span>
                        <span>{game.num_rounds}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Time Limit</span>
                        <span>{game.time_limit}s</span>
                    </div>
                </div>

                <div className="pt-8">
                    {isHost ? (
                        <button
                            onClick={onStartGame}
                            disabled={loading}
                            className="w-full bg-zinc-900 text-white py-3 hover:bg-zinc-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? '...' : 'Start Game'}
                        </button>
                    ) : (
                        <p className="text-zinc-400 text-center animate-pulse">Waiting for host to start ...</p>
                    )}
                </div>
            </div>
        </div>
    );
};
