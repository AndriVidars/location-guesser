'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Map as MapLibre, LngLatBounds } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { NavigationControl, Marker, Source, Layer, MapRef } from 'react-map-gl/maplibre';

interface GameSummaryMapProps {
    rounds: {
        roundNumber: number;
        correct: { lat: number; lng: number };
        guess: { lat?: number; lng?: number };
        distance?: number;
    }[];
}

export default function GameSummaryMap({ rounds }: GameSummaryMapProps) {
    const mapRef = useRef<MapRef>(null);

    // Calculate bounds to fit all points
    const bounds = useMemo(() => {
        const b = new LngLatBounds();
        rounds.forEach(r => {
            b.extend([r.correct.lng, r.correct.lat]);
            if (r.guess.lat && r.guess.lng) {
                b.extend([r.guess.lng, r.guess.lat]);
            }
        });
        return b;
    }, [rounds]);

    // Create GeoJSON for lines connecting guesses to correct location
    const linesGeoJSON = useMemo(() => {
        return {
            type: 'FeatureCollection',
            features: rounds.filter(r => r.guess.lat && r.guess.lng).map(r => ({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [r.guess.lng, r.guess.lat],
                        [r.correct.lng, r.correct.lat]
                    ]
                },
                properties: {
                    round: r.roundNumber
                }
            }))
        };
    }, [rounds]);

    useEffect(() => {
        if (mapRef.current && rounds.length > 0) {
            mapRef.current.fitBounds(bounds, {
                padding: 50,
                duration: 1000
            });
        }
    }, [bounds, rounds.length]);

    return (
        <div className="relative w-full h-full border-4 border-zinc-900 rounded-lg overflow-hidden shadow-xl bg-zinc-100">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: 0,
                    latitude: 20,
                    zoom: 1
                }}
                attributionControl={false}
                mapStyle={{
                    version: 8,
                    sources: {
                        'carto-voyager': {
                            type: 'raster',
                            tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '© CARTO'
                        }
                    },
                    layers: [
                        {
                            id: 'carto-voyager',
                            type: 'raster',
                            source: 'carto-voyager',
                            minzoom: 0,
                            maxzoom: 20
                        }
                    ]
                }}
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

                {rounds.map((r) => (
                    <div key={r.roundNumber}>
                        {/* Correct Location Marker */}
                        <Marker longitude={r.correct.lng} latitude={r.correct.lat}>
                            <div className="relative flex flex-col items-center group z-10">
                                <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-lg" />
                                <div className="absolute top-4 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold shadow mt-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Round {r.roundNumber} Correct
                                </div>
                            </div>
                        </Marker>

                        {/* Player Guess Marker */}
                        {r.guess.lat != null && r.guess.lng != null && r.distance != null && (
                            <Marker longitude={r.guess.lng} latitude={r.guess.lat}>
                                <div className="relative flex flex-col items-center group z-20">
                                    <div
                                        className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-md transition-transform group-hover:scale-125"
                                    />
                                    <div className="absolute top-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                                        <span className="font-bold block">Round {r.roundNumber} Guess</span>
                                        <span className="text-zinc-500">{Math.round(r.distance)} km</span>
                                    </div>
                                </div>
                            </Marker>
                        )}
                    </div>
                ))}

                <NavigationControl position="bottom-right" />
            </Map>
        </div>
    );
}
