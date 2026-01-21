create table public.continents (
  code text primary key,
  name text not null
);

alter table public.continents enable row level security;
create policy "Allow public read access"
  on public.continents
  for select
  using (true);


create table public.countries (
  code text primary key,
  continent_code text not null references public.continents(code),
  name text not null
);


alter table public.countries enable row level security;
create policy "Allow public read access"
  on public.countries
  for select
  using (true);

create table public.cities (
  name text not null,
  country_code text not null references public.countries(code),
  latitude float not null,
  longitude float not null,
  population int not null,
  primary key (name, country_code)
);

alter table public.cities enable row level security;
create policy "Allow public read access"
  on public.cities
  for select
  using (true);

