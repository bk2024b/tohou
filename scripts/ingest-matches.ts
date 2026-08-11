/**
 * Ingestion quotidienne des matchs depuis API-Football (RapidAPI).
 *
 * Usage :
 *   npm run ingest:matches
 *
 * À automatiser via :
 *   - Supabase Edge Function + pg_cron (recommandé, gratuit), ou
 *   - Vercel Cron Job (endpoint /api/cron/ingest appelant cette logique)
 *
 * Reste dans le quota gratuit (100 req/jour) : 1 seul appel récupère
 * TOUS les matchs du jour pour les ligues suivies. Prévoir un 2e passage
 * en soirée pour rafraîchir les scores.
 */
import { createAdminClient } from "../lib/supabase/admin";

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY!;
const API_FOOTBALL_HOST = "v3.football.api-sports.io";

// Ids de ligues API-Football à suivre en priorité (à adapter).
// 61 = Ligue 1, 39 = Premier League, 140 = La Liga, 2 = Champions League
const TRACKED_LEAGUES = [61, 39, 140, 2];

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
  };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

function mapStatus(short: string): string {
  if (["1H", "2H", "HT", "ET", "LIVE"].includes(short)) return "live";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  if (["PST"].includes(short)) return "postponed";
  if (["CANC", "ABD"].includes(short)) return "cancelled";
  return "upcoming";
}

async function fetchFixturesForDate(date: string) {
  const results: ApiFootballFixture[] = [];

  for (const leagueId of TRACKED_LEAGUES) {
    const res = await fetch(
      `https://${API_FOOTBALL_HOST}/fixtures?date=${date}&league=${leagueId}&season=${new Date().getFullYear()}`,
      {
        headers: {
          "x-rapidapi-key": API_FOOTBALL_KEY,
          "x-rapidapi-host": API_FOOTBALL_HOST,
        },
      }
    );

    if (!res.ok) {
      console.error(`Erreur API pour la ligue ${leagueId}:`, res.status);
      continue;
    }

    const json = await res.json();
    results.push(...(json.response ?? []));
  }

  return results;
}

async function main() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  console.log(`Ingestion des matchs pour le ${today}...`);
  const fixtures = await fetchFixturesForDate(today);
  console.log(`${fixtures.length} matchs récupérés.`);

  for (const fx of fixtures) {
    // 1. Upsert de la compétition
    const { data: competition } = await supabase
      .from("competitions")
      .upsert(
        {
          external_id: String(fx.league.id),
          name: fx.league.name,
          country: fx.league.country,
          logo_url: fx.league.logo,
        },
        { onConflict: "external_id" }
      )
      .select("id")
      .single();

    // 2. Upsert du match
    await supabase.from("matches").upsert(
      {
        external_id: String(fx.fixture.id),
        competition_id: competition?.id,
        home_team: fx.teams.home.name,
        away_team: fx.teams.away.name,
        home_team_logo: fx.teams.home.logo,
        away_team_logo: fx.teams.away.logo,
        match_date: fx.fixture.date,
        status: mapStatus(fx.fixture.status.short),
        score_home: fx.goals.home,
        score_away: fx.goals.away,
      },
      { onConflict: "external_id" }
    );
  }

  console.log("Ingestion terminée.");
}

main().catch((err) => {
  console.error("Échec de l'ingestion :", err);
  process.exit(1);
});
