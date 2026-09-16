# LinkMarket
LinkMarket is a Next.js affiliate-product marketplace MVP. It tracks outbound clicks safely, shows transparent affiliate disclosures, and only records commissions through an admin/manual workflow after a real affiliate network reports them.

## Run locally
1. Install Node 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `AUTH_SECRET`.
3. Run `npm install`, `npm run db:generate`, `npm run db:migrate -- --name init`, `npm run db:seed`, and `npm run dev`.
4. Open `http://localhost:3000`. Demo admin: `admin@linkmarket.demo` / `ChangeMe123!` (change it immediately outside demo use).

## Environment
`DATABASE_URL` is the PostgreSQL connection. `AUTH_SECRET` signs HttpOnly session JWTs. `AFFILIATE_ALLOWED_HOSTS` optionally restricts outbound merchant hosts. `NEXT_PUBLIC_APP_URL` sets the canonical origin used by the sitemap.

## How it works
Buttons use `/go/[productId]` (also available at `/api/click/[productId]`), validate the stored HTTP(S) URL, record privacy-minimized click metadata, then redirect. A `?ref=userId` associates a referral. Seed URLs intentionally point to `example.com` and are **DEMO URLs**.

## Admin and commissions
Admin-only routes enforce the `ADMIN` role server-side. Use the admin console to add products and manually record commissions. This MVP intentionally has no fake conversion detection: a production affiliate-network webhook should validate signed network events and create/update commissions there.

## Deployment
Provision PostgreSQL, set the environment variables in your host, run `prisma migrate deploy` and `npm run db:seed` once, then `npm run build` and `npm run start`.

## MVP limits / next work
Auth has basic validation and hashing, but production needs a durable rate limiter, email verification/password reset, CSRF strategy for all mutations, image uploads, affiliate-network webhooks with signature verification, stronger audit logs, role/user management, and a real analytics/chart layer.
