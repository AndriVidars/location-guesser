'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Viewer, ViewerOptions } from 'mapillary-js';

interface StreetViewProps {
  imageId: string;
  onLoad?: () => void;
}

export default function StreetView({ imageId, onLoad }: StreetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imageId) {
      return;
    }

    let mounted = true;

    async function initViewer() {
      try {
        if (!mounted) {
          return;
        }

        if (viewerRef.current) {
          viewerRef.current.moveTo(imageId).catch(() => { return; });
          return;
        }

        const options: ViewerOptions = {
          accessToken: process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN!,
          container: container as HTMLElement,
          imageId: imageId,
          component: {
            cover: false,
            attribution: false
          },
        };

        const viewer = new Viewer(options);
        viewerRef.current = viewer;

        // Notify once the viewer is initialized
        if (onLoad) {
          onLoad();
        }
      } catch (e) {
        console.error('Street View error:', e);
        setError('Street View service unavailable. Returning to home...');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }
    }

    initViewer();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        viewerRef.current.remove();
        viewerRef.current = null;
      }
    };
  }, [imageId, router, onLoad]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="text-center p-4">
          <p className="text-red-500 font-bold mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 z-10 select-none pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-white drop-shadow-md font-sans tracking-wide">
          © Mapillary
        </span>
      </div>
    </div>
  );
}
