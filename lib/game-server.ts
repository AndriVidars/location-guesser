'use server';

import { supabaseServer, type CityData } from './supabase';
import { perturbCoordinates } from './utils/geoutils';

/**
 * Fetches a random city from the database, optionally filtered by continent or country.
 */
export async function getRandomCity(
    continentCode: string | null = null,
    countryCode: string | null = null
): Promise<CityData | null> {
    try {
        let query = supabaseServer
            .from('cities')
            .select(`
        name,
        latitude,
        longitude,
        population,
        countries!inner (
          name,
          continent_code
        )
      `) as any;

        if (countryCode) {
            query = query.eq('country_code', countryCode);
        } else if (continentCode) {
            query = query.eq('countries.continent_code', continentCode);
        }

        // Execute query
        const { data: cities, error } = await query;

        const city = cities[Math.floor(Math.random() * cities.length)];
        const countryData = city.countries;
        const perturbed_coords = perturbCoordinates(city.latitude, city.longitude, 2);

        return {
            city_name: city.name,
            country_name: countryData?.name || 'Unknown',
            latitude: perturbed_coords.latitude,
            longitude: perturbed_coords.longitude,
            population: city.population
        };
    } catch (err) {
        return null;
    }
}
