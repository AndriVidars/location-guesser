/**
 * Perturbs a coordinate (lat, lon) randomly within a given radius in kilometers.
 * This is used to place the player near a city rather than exactly on top of it.
 */
export function perturbCoordinates(lat: number, lon: number, radiusKm: number) {
    const EARTH_RADIUS = 6371;
    const d = Math.sqrt(Math.random()) * radiusKm;
    const theta = Math.random() * 2 * Math.PI;

    const deltaLat = (d * Math.cos(theta)) / EARTH_RADIUS * (180 / Math.PI);
    const deltaLon = (d * Math.sin(theta)) / (EARTH_RADIUS * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI);

    return {
        latitude: lat + deltaLat,
        longitude: lon + deltaLon
    };
}
