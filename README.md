# PronoScore — V1

Site de pronostics football : événements du jour, pronostics, résultats,
comparatif bookmakers, coupon "cote 2" et espace VIP.

**Stack** : Next.js 14 (App Router) + Supabase (Postgres, Auth, RLS) + Tailwind.

## Démarrage

```bash
npm install
cp .env.local.example .env.local
# → remplir les clés Supabase (Project Settings > API)
npm run dev
```

## Mise en place de la base de données

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor** et exécuter le contenu de `supabase/schema.sql`
3. Régénérer les types TypeScript une fois le schéma en place :
   ```bash
   npx supabase gen types typescript --project-id <votre-id> > types/database.ts
   ```

## Ingestion automatique des matchs

Le script `scripts/ingest-matches.ts` récupère les matchs du jour depuis
API-Football (plan gratuit, 100 req/jour) et les upsert dans Supabase.

```bash
npm run ingest:matches
```

**En production**, ne pas lancer ce script manuellement : le brancher sur
un cron (recommandé : Supabase Edge Function + `pg_cron`, gratuit,
déclenché 2x/jour — le matin pour le calendrier, le soir pour les
résultats). Voir la conversation de conception pour le détail de la
stratégie de quota.

## Structure du projet

```
app/
  page.tsx                    → accueil
  evenements/                 → tous les matchs du jour
  pronostics/[date]/[slug]/   → détail d'un pronostic (logique VIP incluse)
  coupon-du-jour/             → coupon combiné quotidien
  resultats/                  → historique + taux de réussite
  bookmakers/, bookmakers/[slug]/  → comparatif + fiches
  vip/                        → page d'abonnement (paiement à brancher)
lib/supabase/
  client.ts   → client navigateur
  server.ts   → client Server Components (respecte RLS)
  admin.ts    → client service role (scripts/cron uniquement)
supabase/schema.sql            → schéma complet + RLS + fonction VIP
scripts/ingest-matches.ts      → ingestion automatique des matchs
```

## Points d'attention avant la mise en prod

- **Contenu VIP** : ne jamais lire `predictions.analysis_text` directement
  côté client pour un pronostic `is_vip = true` — toujours passer par la
  fonction RPC `get_prediction_content` (RLS ne filtre que les lignes,
  pas les colonnes).
- **Légal** : vérifier la réglementation locale sur la publicité pour les
  paris sportifs (mentions obligatoires, âge légal, éventuelle licence
  d'affiliation) avant de publier les liens bookmakers.
- **Paiement VIP** : Stripe pour carte bancaire ; envisager CinetPay ou
  Fedapay si l'audience cible utilise majoritairement le Mobile Money.

## Prochaines étapes (V1.1+)

- [ ] Authentification (Supabase Auth — email/mot de passe + réseaux sociaux)
- [ ] Intégration paiement VIP (Stripe Checkout + webhook)
- [ ] Page profil utilisateur
- [ ] Edge Function de calcul automatique du résultat des pronostics
      (won/lost) à partir du score final
- [ ] Notifications push (nouveau coupon du jour)
