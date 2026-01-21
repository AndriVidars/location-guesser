'use server'

/**
 * Fetches the nearest Mapillary image ID for a given coordinate.
 * Uses the proxy service to handle Mapillary API complexities.
 */
export async function getNearestImageId(lat: number, lng: number): Promise<string | null> {
    const token = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN;
    const baseUrl = 'https://mapillary-extensions.vercel.app';
    const url = `${baseUrl}/random-image?lat=${lat}&lng=${lng}&radius=500&token=${token}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error('Mapillary proxy error:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (data && data.id) {
            return data.id;
        }
        return null;

    } catch (error) {
        console.error('Error fetching Mapillary image:', error);
        return null;
    }
}
