
create table public.games (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    invite_code text unique not null,
    num_rounds int not null check (num_rounds > 0),
    time_limit int not null check (time_limit > 0),
    continent_code text references public.continents(code), -- if null then all continents
    country_code text references public.countries(code), -- if null then all countries
    is_active boolean not null default true
);

create table public.game_rounds (
    id uuid primary key default gen_random_uuid(),
    game_id uuid references public.games(id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    is_active boolean not null default true,
    round_number int not null check (round_number > 0),
    city_name text not null, -- sampled city
    sampled_latitude float not null, -- sampled (within 2 km radius of city centre coords)
    sampled_longitude float not null,
    mapillary_image_id text not null
);

create table public.game_players (
    game_id uuid references public.games(id) on delete cascade not null,
    player_id uuid not null, 
    name text not null,
    is_host boolean not null default false,
    score int not null default 0 check (score >= 0),
    primary key (game_id, player_id)
);

create table public.game_round_players (
    game_round_id uuid references public.game_rounds(id) on delete cascade not null,
    player_id uuid not null, 
    score int not null default 0 check (score >= 0),
    primary key (game_round_id, player_id)
);

-- Enable Row Level Security (RLS)
alter table public.games enable row level security;
alter table public.game_rounds enable row level security;
alter table public.game_players enable row level security;
alter table public.game_round_players enable row level security;

-- Policies: Clients can ONLY read the game state.
-- All writes (Insert/Update/Delete) must happen via Server-Side (Service Role Key)
create policy "Public can read games" on public.games for select using (true);
create policy "Public can read game rounds" on public.game_rounds for select using (true);
create policy "Public can read game players" on public.game_players for select using (true);
create policy "Public can read round players" on public.game_round_players for select using (true);
