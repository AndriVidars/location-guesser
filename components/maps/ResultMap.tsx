'use client';

import { useEffect, useMemo, useRef, memo } from 'react';
import { Map as MapLibre, LngLatBounds } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { NavigationControl, Marker, Source, Layer, MapRef } from 'react-map-gl/maplibre';
import { MAP_STYLE } from '@/lib/map-config';

interface ResultMapProps {
    correctLocation: { lat: number; lng: number };
    guesses: {
        playerId: string;
        name: string;
        lat: number | null;
        lng: number | null;
        distance: number | null; // in km
        color?: string;
    }[];
}

function ResultMap({ correctLocation, guesses }: ResultMapProps) {
    const mapRef = useRef<MapRef>(null);

    // Calculate bounds to fit all points
    const bounds = useMemo(() => {
        const b = new LngLatBounds();
        b.extend([correctLocation.lng, correctLocation.lat]);
        guesses.forEach(g => {
            if (g.lat !== null && g.lng !== null) {
                b.extend([g.lng, g.lat]);
            }
        });
        return b;
    }, [correctLocation, guesses]);

    // Create GeoJSON for lines connecting guesses to correct location
    const linesGeoJSON = useMemo(() => {
        return {
            type: 'FeatureCollection',
            features: guesses
                .filter(g => g.lat !== null && g.lng !== null)
                .map(g => ({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [g.lng!, g.lat!],
                            [correctLocation.lng, correctLocation.lat]
                        ]
                    },
                    properties: {
                        playerId: g.playerId,
                        name: g.name
                    }
                }))
        };
    }, [guesses, correctLocation]);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.fitBounds(bounds, {
                padding: 50,
                duration: 1000,
                maxZoom: 8
            });
        }
    }, [bounds]);

    return (
        <div className="relative w-full h-full border-4 border-zinc-900 rounded-lg overflow-hidden shadow-xl bg-zinc-100">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: correctLocation.lng,
                    latitude: correctLocation.lat,
                    zoom: 1
                }}
                attributionControl={false}
                mapStyle={MAP_STYLE}
            >
                {/* Lines */}
                <Source id="lines" type="geojson" data={linesGeoJSON as any}>
                    <Layer
                        id="line-layer"
                        type="line"
                        paint={{
                            'line-color': '#525252',
                            'line-width': 2,
                            'line-dasharray': [2, 1],
                            'line-opacity': 0.6
                        }}
                    />
                </Source>

                {/* Correct Location Marker */}
                <Marker longitude={correctLocation.lng} latitude={correctLocation.lat}>
                    <div className="relative flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg animate-bounce" />
                        <div className="bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold shadow mt-1 whitespace-nowrap">
                            Correct Location
                        </div>
                    </div>
                </Marker>

                {/* Player Guesses */}
                {guesses.map((guess) => (
                    guess.lat !== null && guess.lng !== null ? (
                        <Marker key={guess.playerId} longitude={guess.lng} latitude={guess.lat}>
                            <div className="relative flex flex-col items-center group z-10 hover:z-20">
                                <div
                                    className="w-3 h-3 rounded-full border border-white shadow-md transition-transform group-hover:scale-125"
                                    style={{ backgroundColor: guess.color || '#f6573b' }}
                                />
                                <div className="absolute top-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="font-bold block">{guess.name}</span>
                                    {guess.distance !== null && <span className="text-zinc-500">{Math.round(guess.distance)} km</span>}
                                </div>
                            </div>
                        </Marker>
                    ) : null
                ))}

                <NavigationControl position="bottom-right" />
            </Map>
        </div>
    );
}

export default memo(ResultMap);
