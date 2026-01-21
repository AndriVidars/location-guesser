'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createGame, joinGame } from '@/lib/server/game';
import { getContinents, getCountries } from '@/lib/server/geo';
import type { ContinentData, CountryData } from '@/lib/types/geo';
import { MainMenu } from '@/components/home/MainMenu';
import { CreateGameForm } from '@/components/home/CreateGameForm';
import { JoinGameForm } from '@/components/home/JoinGameForm';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'main' | 'create' | 'join'>('main');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [rounds, setRounds] = useState(5);
  const [time, setTime] = useState(60);
  const [region, setRegion] = useState<'world' | 'continent' | 'country'>('world');
  const [regionId, setRegionId] = useState('');
  const [code, setCode] = useState('');

  // Metadata
  const [continents, setContinents] = useState<ContinentData[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);

  useEffect(() => {
    Promise.all([getContinents(), getCountries()]).then(([conts, counts]) => {
      setContinents(conts);
      setCountries(counts);
    });
  }, []);

  const handleAction = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const res = view === 'create'
        ? await createGame(name, rounds, time, region === 'continent' ? regionId : null, region === 'country' ? regionId : null)
        : await joinGame(code, name);

      if (res) {
        localStorage.setItem('game_player', JSON.stringify(res.player));
        router.push(`/game/${res.game.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-xs uppercase tracking-wider">
      <div className="w-64 space-y-12">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌍</span>
          <h1 className="font-bold text-lg">Location Guesser</h1>
        </div>

        {view === 'main' && <MainMenu onSelect={setView} />}

        {view === 'create' && (
          <CreateGameForm
            name={name} setName={setName}
            rounds={rounds} setRounds={setRounds}
            time={time} setTime={setTime}
            region={region} setRegion={setRegion}
            regionId={regionId} setRegionId={setRegionId}
            continents={continents} countries={countries}
            onSubmit={handleAction} onCancel={() => setView('main')}
            loading={loading}
          />
        )}

        {view === 'join' && (
          <JoinGameForm
            name={name} setName={setName}
            code={code} setCode={setCode}
            onSubmit={handleAction} onCancel={() => setView('main')}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
