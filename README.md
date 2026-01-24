# Location Guesser

A lightweight streetview-location guessing game built with open data. Players explore random locations and guess where they are on a map.

## Data Sources & Acknowledgements
*   **Mapillary**: Global street-level imagery and 3D viewer (`mapillary-js`).
*   **OpenStreetMap**: Underlying map data.
*   **Carto**: Vector basemap tiles.
*   **MapLibre GL**: Client-side map rendering.

## Tech Stack
*   **Next.js 15**: App Router, Server Actions, and React Server Components.
*   **Supabase**: PostgreSQL database with Realtime subscriptions for multiplayer state.
*   **Python**: Scripts for geospatial data processing and seeding.


# Local Setup

Follow these steps to get the project running locally.

### 1. Prerequisites
- **Node.js** (v18+)
- **Python 3.11+** (for data population scripts)
- **Supabase Account** (or a local Supabase instance)
- **Mapillary Developer Token** (get one [here](https://www.mapillary.com/dashboard/developers))

### 2. Environment Variables
Create a `.env.local` file in the root directory with the following keys:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_default_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mapillary API
NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN=your_mapillary_token
```

### 3. Database Setup
This project uses Supabase. You need to apply the database schema.

1. Login to Supabase CLI:
   ```bash
   npx supabase login
   ```
2. Link your local project to your remote Supabase project:
   ```bash
   npx supabase link --project-ref your_project_ref

3. Push the migrations to the remote database:
   ```bash
   npx supabase db push
   ```

### 4. Populate Geo Data
We use Python scripts to seed the database with continents, countries, and city data.

1. Navigate to the scripts folder: `cd scripts`
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the population script (ensure your `.env.local` is set up first):
   ```bash
   python mapillary_coverage.py
   python populate_geo_data_db.py
   ```

### 5. Run the Application
Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

