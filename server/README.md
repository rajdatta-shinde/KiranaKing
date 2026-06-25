# KiranaKing — Backend API

Express + TypeScript + Prisma (PostgreSQL/Neon) REST API with JWT auth,
Cloudinary image upload, Stripe payments, Brevo email, and Inngest jobs.

## Setup

```bash
cd server
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, etc.
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed             # admin + partners + sample products
npm run dev                 # http://localhost:5000
```

Seeded login: admin `admin123@gmail.com / admin123` (sign in via the "Login as Admin" screen). No delivery partners are seeded — add them from the admin panel.

## Background jobs (Inngest)

In a second terminal:

```bash
npx inngest-cli@latest dev   # discovers jobs at http://localhost:5000/api/inngest
```

Jobs: `low-stock-alert` (stock < 10 → email admin), `monthly-offers`
(cron 1st of month → email all users), `auto-assign-rider` (5 min after an
order, assign an active partner if none was set).

## API surface

| Group | Routes |
|---|---|
| Auth | `POST /api/auth/register \| /login \| /logout`, `GET /api/auth/me` |
| Products | `GET /api/products`, `GET /api/products/:id`, `POST/PUT/DELETE` (admin) |
| Orders | `POST /api/orders`, `GET /api/orders/my`, `GET /api/orders/:id`, `PATCH /:id/cancel \| /status`, `GET/PATCH /:id/location` |
| Addresses | `GET/POST /api/addresses`, `PUT/DELETE /api/addresses/:id` |
| Admin | `GET /api/admin/dashboard \| /orders`, `PATCH /orders/:id/assign`, partner CRUD `/api/admin/partners` |
| Delivery | `POST /api/delivery/login \| /logout`, `GET /me \| /orders`, `POST /api/orders/:id/verify-otp` |
| Payments | `POST /api/payments/create-intent`, `POST /api/payments/webhook` (raw body) |

Auth is via httpOnly `token` cookie or `Authorization: Bearer <token>`. Admin
access is granted to emails listed in `ADMIN_EMAILS`.

## Deploy (Vercel)

- Push the repo to GitHub and import the `server` directory as a Vercel project.
- Add all `.env` values as Vercel environment variables.
- Run `npx prisma migrate deploy` against the production DB.
- In the Inngest dashboard, sync the app URL `https://<your-domain>/api/inngest`.
- Point the Stripe webhook at `https://<your-domain>/api/payments/webhook`.
