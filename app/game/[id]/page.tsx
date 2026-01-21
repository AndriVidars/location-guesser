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

    useEffect(() => {
        const stored = localStorage.getItem('game_player');
        if (!stored) {
            router.push('/');
            return;
        }
        setPlayer(JSON.parse(stored));

        async function init() {
            const { data: g } = await supabaseClient.from('games').select('*').eq('id', gameId).single();
            if (!g) return router.push('/');
            setGame(g);

            // Fetch initial players
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
        }

        init();

        const sub = supabaseClient
            .channel(`game:${gameId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
                p => setGame(p.new as Game))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_rounds', filter: `game_id=eq.${gameId}` },
                p => setRound(p.new as GameRound))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
                async () => {
                    const { data: pList } = await supabaseClient.from('game_players').select('*').eq('game_id', gameId);
                    if (pList) setPlayers(pList);
                })
            .subscribe();

        return () => { supabaseClient.removeChannel(sub); };
    }, [gameId, router]);

    const handleCopy = () => {
        if (!game?.invite_code) return;
        navigator.clipboard.writeText(game.invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
