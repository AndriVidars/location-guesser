export interface ContinentData {
    code: string;
    name: string;
}

export interface CountryData {
    code: string;
    name: string;
    continent_code: string;
}

export interface CityData {
    city_name: string;
    country_name: string;
    latitude: number;
    longitude: number;
    population: number;
}

