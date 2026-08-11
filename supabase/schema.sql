-- ============================================================
-- PRONOSCORE — Schéma V1
-- À exécuter dans l'éditeur SQL de Supabase (Database > SQL Editor)
-- ============================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (étend auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  is_vip boolean not null default false,
  vip_expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Création automatique du profil à l'inscription
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Profils visibles par leur propriétaire"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- BOOKMAKERS
-- ============================================================
create table public.bookmakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,          -- texte riche (markdown ou HTML)
  bonus_text text,
  rating numeric(2,1) check (rating between 0 and 5),
  affiliate_link text,
  legal_disclaimer text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookmakers enable row level security;

create policy "Bookmakers publiés visibles par tous"
  on public.bookmakers for select
  using (is_published = true);

-- ============================================================
-- COMPETITIONS (ligues)
-- ============================================================
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,   -- id retourné par l'API sportive
  name text not null,
  country text,
  logo_url text,
  priority int not null default 100, -- plus petit = affiché en premier
  created_at timestamptz not null default now()
);

alter table public.competitions enable row level security;

create policy "Compétitions visibles par tous"
  on public.competitions for select
  using (true);

-- ============================================================
-- MATCHES
-- ============================================================
create type match_status as enum ('upcoming', 'live', 'finished', 'postponed', 'cancelled');

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,   -- id retourné par l'API sportive (dédoublonnage)
  competition_id uuid references public.competitions(id) on delete set null,
  home_team text not null,
  away_team text not null,
  home_team_logo text,
  away_team_logo text,
  match_date timestamptz not null,
  status match_status not null default 'upcoming',
  score_home int,
  score_away int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_matches_date on public.matches (match_date);
create index idx_matches_status on public.matches (status);

alter table public.matches enable row level security;

create policy "Matchs visibles par tous"
  on public.matches for select
  using (true);

-- ============================================================
-- PREDICTIONS (pronostics)
-- ============================================================
create type prediction_result as enum ('pending', 'won', 'lost', 'void');

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  slug text unique not null,          -- pour l'URL /pronostics/[date]/[slug]
  title text not null,
  analysis_text text not null,        -- l'analyse complète (contenu premium potentiel)
  analysis_preview text,              -- accroche visible même sans être VIP
  predicted_outcome text not null,    -- ex: "Victoire PSG", "Plus de 2.5 buts"
  predicted_odds numeric(5,2),
  confidence_level int check (confidence_level between 1 and 5),
  is_vip boolean not null default false,
  result prediction_result not null default 'pending',
  published_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create index idx_predictions_match on public.predictions (match_id);
create index idx_predictions_published on public.predictions (published_at desc);

alter table public.predictions enable row level security;

-- Tout le monde voit les métadonnées (titre, cote, preview) mais le texte
-- complet des pronostics VIP est protégé au niveau applicatif (voir note
-- plus bas) — Postgres RLS ne filtre pas les colonnes, seulement les lignes.
create policy "Pronostics publiés visibles par tous"
  on public.predictions for select
  using (published_at <= now());

-- ============================================================
-- COUPONS (coupon "cote 2" quotidien)
-- ============================================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  coupon_date date not null unique,
  title text not null default 'Coupon du jour',
  total_odds numeric(6,2),
  status prediction_result not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "Coupons visibles par tous"
  on public.coupons for select
  using (true);

create table public.coupon_predictions (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  prediction_id uuid not null references public.predictions(id) on delete cascade,
  primary key (coupon_id, prediction_id)
);

alter table public.coupon_predictions enable row level security;

create policy "Liaisons coupon visibles par tous"
  on public.coupon_predictions for select
  using (true);

-- ============================================================
-- SUBSCRIPTIONS (abonnement VIP)
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'stripe', -- 'stripe' | 'cinetpay' | 'fedapay'
  provider_subscription_id text,
  status text not null default 'active',  -- active | canceled | past_due
  plan text not null default 'vip_monthly',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Un utilisateur voit ses propres abonnements"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- PROTECTION DU CONTENU VIP
-- RLS filtre les LIGNES, pas les colonnes : un non-VIP peut donc lire
-- une ligne "predictions" en entier via l'API auto-générée Supabase,
-- y compris analysis_text. On expose donc une fonction qui masque le
-- texte complet si l'utilisateur n'est pas VIP, et c'est CETTE fonction
-- que le front doit appeler pour tout pronostic marqué is_vip = true.
-- ============================================================
create function public.get_prediction_content(prediction_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_vip boolean;
  v_user_is_vip boolean;
  v_text text;
begin
  select is_vip, analysis_text into v_is_vip, v_text
  from public.predictions where id = prediction_id;

  if v_is_vip is null then
    return null; -- pronostic introuvable
  end if;

  if v_is_vip = false then
    return v_text; -- contenu gratuit, accessible à tous
  end if;

  select coalesce(is_vip, false) into v_user_is_vip
  from public.profiles where id = auth.uid();

  if v_user_is_vip then
    return v_text;
  else
    return null; -- masqué : le front affiche analysis_preview + un CTA abonnement
  end if;
end;
$$;

-- ============================================================
-- TRIGGER : mise à jour automatique de `result` sur les pronostics
-- quand un match passe en `finished`
-- ============================================================
create function public.settle_predictions_on_finish()
returns trigger as $$
begin
  if new.status = 'finished' and (old.status is distinct from 'finished') then
    -- Exemple simplifié : à adapter selon votre logique de calcul du résultat
    -- (1N2, over/under, etc.) une fois la structure des pronostics affinée.
    update public.predictions
    set result = 'pending'  -- placeholder : logique de calcul à implémenter
    where match_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_match_finished
  after update on public.matches
  for each row execute procedure public.settle_predictions_on_finish();

-- ============================================================
-- updated_at automatique
-- ============================================================
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_bookmakers
  before update on public.bookmakers
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_matches
  before update on public.matches
  for each row execute procedure public.set_updated_at();
