import os
from supabase import create_client
from dotenv import load_dotenv
from tqdm import tqdm
import json

load_dotenv('../.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use service role for inserts

supabase = create_client(url, key)

with open('continents.json', 'r', encoding='utf-8') as f:
    continents = json.load(f)
    for continent in tqdm(continents, desc="Inserting continents"):
        supabase.table('continents').insert({"code": continent['code'], "name": continent['name'], "area_km2": continent['area_km2']}).execute()

with open('countries.json', 'r', encoding='utf-8') as f:
    countries = json.load(f)
    for country in tqdm(countries, desc="Inserting countries"):
        supabase.table('countries').insert({"code": country['code'], "continent_code": country['continent_code'], "name": country['name'], "area_km2": country['area_km2']}).execute()

with open('cities.json', 'r', encoding='utf-8') as f:
    cities = json.load(f)
    for city in tqdm(cities, desc="Inserting cities"):
        supabase.table('cities').insert({"name": city['name'], "country_code": city['country_code'], "latitude": city['lat'], "longitude": city['lon'], "population": city['pop']}).execute()

    
