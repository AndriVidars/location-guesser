'use client';

import { useState, useEffect } from 'react';
import StreetView from "@/app/core/maps/streetview";
import GuessMap from "@/app/core/maps/map";
import { getRandomCity } from '@/lib/game-server';
import { getNearestImageId } from './core/maps/mapillary';

interface GameSession {
  imageId: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  useEffect(() => {
    async function fetchInitialLocation() {
      let foundImage = false;
      while (!foundImage) {
        const city = await getRandomCity();
        if (city) {
          const id = await getNearestImageId(city.latitude, city.longitude);
          if (id) {
            setGameSession({
              imageId: id,
              lat: city.latitude,
              lng: city.longitude,
              city: city.city_name,
              country: city.country_name
            });
            foundImage = true;
          }
        }
      }
    }

    fetchInitialLocation();
  }, []);

  const showLoading = !gameSession || !isReady;

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-[#f9f9f7] font-sans overflow-hidden dark:bg-zinc-950">
      {showLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f9f9f7] dark:bg-zinc-950 transition-opacity duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin dark:border-zinc-800 dark:border-t-zinc-200" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              Loading
            </p>
          </div>
        </div>
      )}

      {gameSession && (
        <div className={`transition-all duration-1000 ${isReady ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}>
          <div className="relative h-[85vh] w-[90vw] max-w-7xl overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <StreetView
              imageId={gameSession.imageId}
              onLoad={() => setIsReady(true)}
            />
          </div>

          <div className="absolute bottom-10 right-10 z-20 group flex flex-col items-end gap-3">
            <div className="h-40 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:h-[400px] group-hover:w-[600px] dark:border-zinc-800 dark:bg-zinc-900">
              {isReady && (
                <GuessMap />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
