'use client';

import { useEffect, useRef } from 'react';
import { Viewer, ViewerOptions } from 'mapillary-js';
import { getNearestImageId } from './mapillary';

interface StreetViewProps {
  lat: number;
  lng: number;
}

export default function StreetView({ lat, lng }: StreetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let mounted = true;

    async function initViewer() {
      try {
        const imageId = await getNearestImageId(lat, lng);

        if (!mounted) {
          return;
        }
        if (!imageId) {
          return;
        }

        if (viewerRef.current) {
          viewerRef.current.moveTo(imageId).catch((err) => { return; });
          return;
        }

        const options: ViewerOptions = {
          accessToken: process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN || '',
          container: container as HTMLElement,
          imageId: imageId,
          component: { cover: false },
        };

        const viewer = new Viewer(options);
        viewerRef.current = viewer;
      } catch (e) {
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
  }, [lat, lng]);

  return <div ref={containerRef} style={{ width: '400px', height: '300px' }} />;
}
