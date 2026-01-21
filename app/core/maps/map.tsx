'use client';

import { useState } from 'react';
import { Map as MapLibre } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { NavigationControl, Marker, AttributionControl } from 'react-map-gl/maplibre';

interface GuessMapProps {
    onGuess?: (lat: number, lng: number) => void;
}

export default function GuessMap({ onGuess }: GuessMapProps) {
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

    return (
        <div className="relative overflow-hidden w-full h-full">
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
                    if (onGuess) {
                        onGuess(lat, lng);
                    }
                }}
            >
                {marker && (
                    <Marker longitude={marker.lng} latitude={marker.lat} color="#f6573bff" />
                )}
                <AttributionControl compact={true} position="bottom-left" />
                <NavigationControl position="bottom-right" />
            </Map>
        </div>
    );
}
