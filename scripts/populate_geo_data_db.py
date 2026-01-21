import os
from supabase import create_client
from dotenv import load_dotenv
from tqdm import tqdm
import json

load_dotenv('../.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use service role for inserts

supabase = create_client(url, key)

with open('country_name_dict.json', 'r', encoding='utf-8') as f:
    country_name_dict = json.load(f)

with open('continent_name_dict.json', 'r', encoding='utf-8') as f:
    continent_name_dict = json.load(f)
    for code, name in tqdm(continent_name_dict.items(), desc="Inserting continents"):
        supabase.table('continents').insert({"code": code, "name": name}).execute()


with open('countries_by_continent.json', 'r', encoding='utf-8') as f:
    countries_by_continent = json.load(f)
    for continent_code, country_codes in tqdm(countries_by_continent.items(), desc="Inserting countries"):
        for country_code in country_codes:
            supabase.table('countries').insert({"code": country_code, "continent_code": continent_code, "name": country_name_dict.get(country_code)}).execute()

with open('mapillary_city_coverage.json', 'r', encoding='utf-8') as f:
    mapillary_city_coverage = json.load(f)
    for country_code, cities in tqdm(mapillary_city_coverage.items(), desc="Inserting cities"):
        for city_name, city_data in cities.items():
            supabase.table('cities').insert({"country_code": country_code, "name": city_name, "latitude": city_data['lat'], "longitude": city_data['lon'], "population": city_data['pop']}).execute()

    
