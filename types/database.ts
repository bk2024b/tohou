// ⚠️ Fichier généré normalement par la CLI Supabase :
//   npx supabase gen types typescript --project-id <votre-projet-id> > types/database.ts
// Ce placeholder permet au projet de compiler avant la première génération.

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      match_status: "upcoming" | "live" | "finished" | "postponed" | "cancelled";
      prediction_result: "pending" | "won" | "lost" | "void";
    };
  };
};
