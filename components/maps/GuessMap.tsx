'use client';

import { useState } from 'react';
import { Map as MapLibre } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { NavigationControl, Marker } from 'react-map-gl/maplibre';

interface GuessMapProps {
    onGuess: (lat: number, lng: number) => void;
}

export default function GuessMap({ onGuess }: GuessMapProps) {
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

    return (
        <div className="relative w-full h-full border-4 border-zinc-500 rounded-lg overflow-hidden shadow-lg group-hover:border-white transition-colors duration-300">
            <Map
                initialViewState={{
                    longitude: 0,
                    latitude: 45,
                    zoom: 0
                }}
                attributionControl={false}
                mapStyle={{
                    version: 8,
                    sources: {
                        'esri-satellite': {
                            type: 'raster',
                            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                            tileSize: 256,
                            attribution: 'Esri, Maxar, Earthstar Geographics'
                        },
                        'carto-labels': {
                            type: 'raster',
                            tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png'],
                            tileSize: 256
                        }
                    },
                    layers: [
                        {
                            id: 'satellite',
                            type: 'raster',
                            source: 'esri-satellite',
                            minzoom: 0,
                            maxzoom: 20
                        },
                        {
                            id: 'labels',
                            type: 'raster',
                            source: 'carto-labels',
                            minzoom: 0,
                            maxzoom: 20,
                            paint: {
                                'raster-opacity': 1.0
                            }
                        }
                    ]
                }}
                onClick={(e) => {
                    const { lat, lng } = e.lngLat;
                    setMarker({ lat, lng });
                }}
            >
                {marker && (
                    <Marker longitude={marker.lng} latitude={marker.lat} color="#f6573bff" />
                )}
                <NavigationControl position="bottom-right" />
            </Map>

            <div className="absolute bottom-1 left-1 z-10">
                <div className="flex items-center gap-1 bg-black/40 hover:bg-black/90 backdrop-blur-sm text-white/70 hover:text-white px-2 py-0.5 rounded-full transition-colors duration-300 cursor-help group">
                    <span className="font-serif font-bold italic text-xs">i</span>
                    <span className="text-[10px] max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
                        Esri, Maxar, Earthstar Geographics, © CARTO
                    </span>
                </div>
            </div>

            {marker && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-6 rounded text-xs font-bold tracking-widest uppercase transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
                        onClick={() => {
                            onGuess(marker.lat, marker.lng);
                        }}
                    >
                        Guess
                    </button>
                </div>
            )}
        </div>
    );
}
