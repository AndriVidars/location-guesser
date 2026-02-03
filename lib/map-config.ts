import type { StyleSpecification } from 'maplibre-gl';

export const MAP_STYLE: StyleSpecification = {
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
};
