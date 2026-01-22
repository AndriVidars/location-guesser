'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { startGame } from '@/lib/server/game';
import type { Game, GamePlayer, GameRound } from '@/lib/types/game';
import { Lobby } from '@/components/game/Lobby';
import { GameView } from '@/components/game/GameView';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: gameId } = use(params);
    const router = useRouter();
    const [game, setGame] = useState<Game | null>(null);
    const [player, setPlayer] = useState<GamePlayer | null>(null);
    const [players, setPlayers] = useState<GamePlayer[]>([]);
    const [round, setRound] = useState<GameRound | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Safeguard against accidental exit
    useEffect(() => {
        if (!game?.is_active) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };

        const handlePopState = (e: PopStateEvent) => {
            window.history.pushState(null, '', window.location.href);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        window.history.pushState(null, '', window.location.href);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [game?.is_active, router]);

    useEffect(() => {
        const stored = localStorage.getItem('game_player');
        if (!stored) {
            router.push('/');
            return;
        }
        setPlayer(JSON.parse(stored));

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
                if (r) setRound(r);
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
                (payload) => setRound(payload.new as GameRound))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
                async () => {
                    const { data: pList } = await supabaseClient.from('game_players').select('*').eq('game_id', gameId);
                    if (pList) setPlayers(pList);
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

    return <GameView game={game!} round={round} />;
}
