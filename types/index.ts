export interface Bookmaker {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  bonus_text: string | null;
  rating: number | null;
  affiliate_link: string | null;
  legal_disclaimer: string | null;
  is_published: boolean;
}

export interface Competition {
  id: string;
  name: string;
  country: string | null;
  logo_url: string | null;
  priority: number;
}

export type MatchStatus =
  | "upcoming"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export interface Match {
  id: string;
  competition_id: string | null;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  match_date: string;
  status: MatchStatus;
  score_home: number | null;
  score_away: number | null;
  competition?: Competition;
}

export type PredictionResult = "pending" | "won" | "lost" | "void";
export type PredictionMarket = "1x2" | "double_chance" | "btts" | "over_under";

export interface Prediction {
  id: string;
  match_id: string;
  slug: string;
  title: string;
  analysis_preview: string | null;
  predicted_outcome: string;
  market: PredictionMarket | null;
  selection: string | null;
  predicted_odds: number | null;
  confidence_level: number | null;
  is_vip: boolean;
  result: PredictionResult;
  published_at: string;
  match?: Match;
}

export interface Coupon {
  id: string;
  coupon_date: string;
  title: string;
  total_odds: number | null;
  status: PredictionResult;
  predictions?: Prediction[];
}
