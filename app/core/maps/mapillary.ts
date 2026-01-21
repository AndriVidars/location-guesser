export async function getNearestImageId(lat: number, lng: number): Promise<string | null> {
    const token = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN;
    const url = `/api/mapillary/random-image?lat=${lat}&lng=${lng}&radius=500&token=${token}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }
        const data = await response.json();

        if (data && data.id) {
            return data.id;
        }
        return null;

    } catch (error) {

        return null;
    }
}
