# Llavia

Application for property management built with Next.js 15, Prisma, Tailwind, and Auth.js.

## Features
- **Landlord Portal**: Manage Rooms, Tenants, Leases (automatic invoices), and Payments.
- **Tenant Portal**: View status, download invoices, create tickets.
- **Automated Workers**: Daily checks for overdue invoices and WhatsApp reminders (Twilio).
- **RBAC**: Strict role separation using Middleware and Server Actions.

## Setup

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 18+

### 2. Environment Variables
Copy `.env` and fill in the secrets:
```bash
cp .env.example .env
# Edit .env, especially AUTH_SECRET and WORKER_SECRET
```

### 3. Run with Docker (Recommended for Prod)
```bash
docker compose up -d
```
This starts the Database JSON and the Next.js app.

### 4. Database Setup (First Time)
Once the DB is up:
```bash
# Apply migrations
npx prisma migrate deploy

# Seed initial admin user (admin@rentmanager.com / admin123)
node prisma/seed.ts
```

### 5. Development Mode
If you want to run the app locally while keeping DB in Docker:
```bash
# Start only DB
docker compose up -d db

# Install dependencies
npm install

# Generate Client
npx prisma generate

# Run App
npm run dev
```

## Workers
The application includes background workers at `/api/worker/*`.
To trigger them manually or via cron:
```bash
npx ts-node scripts/run-worker-daily.ts
```
Or set up a system cron to `curl` the endpoints with `x-worker-secret`.

## Architecture
- `src/app`: App Router pages.
- `src/actions`: Server Actions (Business Logic).
- `src/lib`: Shared utilities (Auth, DB, RBAC).
- `src/middleware.ts`: Route protection.
