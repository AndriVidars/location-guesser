import pyproj
import mapillary.interface as mly
from geonamescache import GeonamesCache
from collections import defaultdict
from tqdm import tqdm
import json
import os
from dotenv import load_dotenv
load_dotenv('../.env.local')

TOKEN = os.getenv("NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN")
mly.set_access_token(TOKEN)


def main():
    gc = GeonamesCache()
    
    continents_list = [
        {"code": "AF", "name": "Africa", "area_km2": 30_200_000}, 
        {"code": "AS", "name": "Asia", "area_km2": 44_579_000}, 
        {"code": "EU", "name": "Europe", "area_km2": 10_180_000}, 
        {"code": "NA", "name": "North America", "area_km2": 24_240_000}, 
        {"code": "OC", "name": "Oceania", "area_km2": 8_910_000}, 
        {"code": "SA", "name": "South America", "area_km2": 17_840_000}, 
        {"code": "AN", "name": "Antarctica", "area_km2": 14_000_000}
    ]

    with open('continents.json', 'w', encoding='utf-8') as f:
        json.dump(continents_list, f, ensure_ascii=False)
    
    countries = gc.get_countries()
    countries_list = [
        {
            "code": k, 
            "name": v['name'], 
            "continent_code": v['continentcode'], 
            "area_km2": v['areakm2']
        } 
        for k, v in countries.items()
    ]

    with open('countries.json', 'w', encoding='utf-8') as f:
        json.dump(countries_list, f, ensure_ascii=False)

    cities = gc.get_cities()
    cities_by_country = defaultdict(list)
    for city_id, city_data in cities.items():
        country_code = city_data['countrycode']
        cities_by_country[country_code].append(city_data)

    sorted_country_codes = sorted(cities_by_country.keys(), key=lambda c: countries.get(c, {}).get('name', c))
    
    # only export cities with coverage
    cities_with_coverage = []
    for country_code in tqdm(sorted_country_codes, desc="Processing countries"):
        country_cities = cities_by_country[country_code]
        country_cities.sort(key=lambda x: x['population'], reverse=True)
        top_cities = country_cities[:10]
        
        for city in top_cities:
            city_name = city['name']
            lat = city['latitude']
            lon = city['longitude']
            pop = city['population']
            
            try:
                data = mly.get_image_close_to(longitude=lon, latitude=lat, radius=500)
                if data:
                    features = data.to_dict().get('features', [])
                    if features:
                        cities_with_coverage.append({
                            "name": city_name,
                            "country_code": country_code,
                            "lat": lat, 
                            "lon": lon, 
                            "pop": pop
                        })
                    
                    print(f"City: {city_name}, Population: {pop}, Coverage: {'✅' if features else '❌'}")
                                
            except Exception as e:
                print(f"Error fetching image for city {city_name}: {e}")
                continue
    
    with open('cities.json', 'w', encoding='utf-8') as f:
        json.dump(cities_with_coverage, f, ensure_ascii=False)
    
if __name__ == "__main__":
    main()
