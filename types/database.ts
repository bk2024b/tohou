// Types écrits à la main à partir de supabase/schema.sql + migrations.
// À terme, remplacez ce fichier par la génération officielle :
//   npx supabase gen types typescript --project-id <votre-id> > types/database.ts
// (le format généré est compatible avec celui-ci, il ajoute juste plus
// de détails — notamment les vraies Relationships entre tables.)

export type MatchStatus =
  | "upcoming"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export type PredictionResultEnum = "pending" | "won" | "lost" | "void";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          is_vip: boolean;
          vip_expires_at: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          is_vip?: boolean;
          vip_expires_at?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          is_vip?: boolean;
          vip_expires_at?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      bookmakers: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          bonus_text?: string | null;
          rating?: number | null;
          affiliate_link?: string | null;
          legal_disclaimer?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          bonus_text?: string | null;
          rating?: number | null;
          affiliate_link?: string | null;
          legal_disclaimer?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      competitions: {
        Row: {
          id: string;
          external_id: string | null;
          name: string;
          country: string | null;
          logo_url: string | null;
          priority: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          name: string;
          country?: string | null;
          logo_url?: string | null;
          priority?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          name?: string;
          country?: string | null;
          logo_url?: string | null;
          priority?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      matches: {
        Row: {
          id: string;
          external_id: string | null;
          competition_id: string | null;
          home_team: string;
          away_team: string;
          home_team_logo: string | null;
          away_team_logo: string | null;
          match_date: string;
          status: MatchStatus;
          score_home: number | null;
          score_away: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          competition_id?: string | null;
          home_team: string;
          away_team: string;
          home_team_logo?: string | null;
          away_team_logo?: string | null;
          match_date: string;
          status?: MatchStatus;
          score_home?: number | null;
          score_away?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          competition_id?: string | null;
          home_team?: string;
          away_team?: string;
          home_team_logo?: string | null;
          away_team_logo?: string | null;
          match_date?: string;
          status?: MatchStatus;
          score_home?: number | null;
          score_away?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      predictions: {
        Row: {
          id: string;
          match_id: string;
          author_id: string | null;
          slug: string;
          title: string;
          analysis_text: string;
          analysis_preview: string | null;
          predicted_outcome: string;
          market: string | null;
          selection: string | null;
          predicted_odds: number | null;
          confidence_level: number | null;
          is_vip: boolean;
          result: PredictionResultEnum;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          author_id?: string | null;
          slug: string;
          title: string;
          analysis_text: string;
          analysis_preview?: string | null;
          predicted_outcome: string;
          market?: string | null;
          selection?: string | null;
          predicted_odds?: number | null;
          confidence_level?: number | null;
          is_vip?: boolean;
          result?: PredictionResultEnum;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          author_id?: string | null;
          slug?: string;
          title?: string;
          analysis_text?: string;
          analysis_preview?: string | null;
          predicted_outcome?: string;
          market?: string | null;
          selection?: string | null;
          predicted_odds?: number | null;
          confidence_level?: number | null;
          is_vip?: boolean;
          result?: PredictionResultEnum;
          published_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      coupons: {
        Row: {
          id: string;
          coupon_date: string;
          title: string;
          total_odds: number | null;
          status: PredictionResultEnum;
          created_at: string;
        };
        Insert: {
          id?: string;
          coupon_date: string;
          title?: string;
          total_odds?: number | null;
          status?: PredictionResultEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          coupon_date?: string;
          title?: string;
          total_odds?: number | null;
          status?: PredictionResultEnum;
          created_at?: string;
        };
        Relationships: [];
      };

      coupon_predictions: {
        Row: {
          coupon_id: string;
          prediction_id: string;
        };
        Insert: {
          coupon_id: string;
          prediction_id: string;
        };
        Update: {
          coupon_id?: string;
          prediction_id?: string;
        };
        Relationships: [];
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_subscription_id: string | null;
          status: string;
          plan: string;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          plan?: string;
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          plan?: string;
          current_period_end?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      compute_prediction_result: {
        Args: {
          p_market: string | null;
          p_selection: string | null;
          p_score_home: number;
          p_score_away: number;
        };
        Returns: PredictionResultEnum;
      };
      get_prediction_content: {
        Args: { prediction_id: string };
        Returns: string | null;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      settle_coupon: {
        Args: { p_coupon_id: string };
        Returns: undefined;
      };
    };

    Enums: {
      match_status: MatchStatus;
      prediction_result: PredictionResultEnum;
    };
  };
};
