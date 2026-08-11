import Link from "next/link";
import type { Match, Prediction } from "@/types";

const STATUS_LABEL: Record<Match["status"], string> = {
  upcoming: "À venir",
  live: "En direct",
  finished: "Terminé",
  postponed: "Reporté",
  cancelled: "Annulé",
};

export function MatchCard({
  match,
  prediction,
}: {
  match: Match;
  prediction?: Prediction;
}) {
  const kickoff = new Date(match.match_date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
        <span>{match.competition?.name ?? "Compétition"}</span>
        <span
          className={
            match.status === "live"
              ? "text-red-600 font-semibold"
              : match.status === "finished"
              ? "text-neutral-400"
              : ""
          }
        >
          {match.status === "upcoming" ? kickoff : STATUS_LABEL[match.status]}
        </span>
      </div>

      <div className="flex items-center justify-between font-semibold">
        <span>{match.home_team}</span>
        {match.status === "finished" || match.status === "live" ? (
          <span className="tabular-nums">
            {match.score_home} - {match.score_away}
          </span>
        ) : (
          <span className="text-neutral-400 text-sm">vs</span>
        )}
        <span>{match.away_team}</span>
      </div>

      {prediction && (
        <Link
          href={`/pronostics/${prediction.published_at.slice(0, 10)}/${
            prediction.slug
          }`}
          className="mt-3 flex items-center justify-between bg-brand/5 hover:bg-brand/10 rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <span className="text-brand font-medium">
            {prediction.predicted_outcome}
          </span>
          {prediction.predicted_odds && (
            <span className="font-bold text-brand-dark">
              @{prediction.predicted_odds}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}
