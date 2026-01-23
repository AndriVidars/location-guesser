'use server';

import { supabaseServer } from '../supabase';
import { perturbCoordinates } from '../utils/geo';
import type { CityData, ContinentData, CountryData } from '../types/geo';

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

        const { data: cities, error } = await query;
        if (error || !cities || cities.length === 0) return null;

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
        console.error('Error in getRandomCity:', err);
        return null;
    }
}

export async function getContinents(): Promise<ContinentData[]> {
    const { data, error } = await supabaseServer
        .from('continents')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching continents:', error);
        return [];
    }
    return data || [];
}

export async function getContinentArea(continentCode: string): Promise<number> {
    const { data, error } = await supabaseServer
        .from('continents')
        .select('area_km2')
        .eq('code', continentCode)
        .single();

    if (error || !data) {
        console.error('Error fetching continent area:', error);
        return 149e6; // default use earths total land area
    }
    return data.area_km2;
}

export async function getCountries(continentCode?: string | null): Promise<CountryData[]> {
    let query = supabaseServer
        .from('countries')
        .select('*')
        .order('name');

    if (continentCode) {
        query = query.eq('continent_code', continentCode);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
    return data || [];
}
