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
    continents = gc.get_continents()
    countries = gc.get_countries()
    cities = gc.get_cities()

    continent_name_dict = {k: v['asciiName'] for k, v in continents.items()}
    country_name_dict = {k: v['name'] for k, v in countries.items()}
    with open('continent_name_dict.json', 'w', encoding='utf-8') as f:
        json.dump(continent_name_dict, f, ensure_ascii=False)
    with open('country_name_dict.json', 'w', encoding='utf-8') as f:
        json.dump(country_name_dict, f, ensure_ascii=False)
    
    countries_by_continent = defaultdict(list)
    for k, v in countries.items():
        countries_by_continent[v['continentcode']].append(k)
    with open('countries_by_continent.json', 'w', encoding='utf-8') as f:
        json.dump(countries_by_continent, f, ensure_ascii=False)
    

    cities_by_country = defaultdict(list)
    for city_id, city_data in cities.items():
        country_code = city_data['countrycode']
        cities_by_country[country_code].append(city_data)

    sorted_country_codes = sorted(cities_by_country.keys(), key=lambda c: countries.get(c, {}).get('name', c))
    
    # only export cities with coverage
    out = defaultdict(dict) # country -> {city -> {lat, lon, pop}}}
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
                        out[country_code][city_name] = {"lat": lat, "lon": lon, "pop": pop}
                    
                    print(f"City: {city_name}, Population: {pop}, Coverage: {'✅' if features else '❌'}")
                                
            except Exception as e:
                print(f"Error fetching image for city {city_name}: {e}")
                continue
    
    with open('mapillary_city_coverage.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)
    
if __name__ == "__main__":
    main()
