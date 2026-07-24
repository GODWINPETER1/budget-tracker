# Ledger — Budget & Expense Tracker

A full-stack budget tracking app with recurring transactions, category budgets, and spending insights — built to demonstrate end-to-end full-stack development: schema design, REST API architecture, authentication, and a custom-designed React frontend.

## Live Demo

- App: [add your deployed frontend URL]
- API: [add your deployed backend URL]

## Features

- **Auth** — JWT-based registration/login, protected routes, row-level authorization (users can only ever access their own data)
- **Transactions** — full CRUD, filterable by type/category/date range, paginated
- **Categories** — custom income/expense categories per user
- **Budgets** — monthly spending limits per category, with live "amount spent" calculated from real transaction data
- **Recurring transactions** — define a rule once (e.g. "Rent, $1200, monthly"), and the backend generates the actual transaction history automatically, tracking exactly where it left off to avoid duplicates
- **Dashboard** — income/expense/balance summary, category breakdown (pie chart), 6-month income vs. expense trend (bar chart)

## Tech Stack

**Backend:** Node.js, Express, MySQL, Knex (query builder + migrations), JWT, bcrypt
**Frontend:** React (Vite), React Router, Tailwind CSS v4, Recharts, Axios

## Architecture Decisions Worth Knowing

- **Knex migrations, not manual schema edits** — every schema change is a versioned, reversible file. Migrations are never edited after being applied; changes are always a new migration.
- **Money stored as `DECIMAL`, never `FLOAT`** — avoids floating-point rounding errors in financial data.
- **Deliberate foreign key behavior**: deleting a user cascades (removes their data); deleting a category on a *transaction* sets it to `NULL` (preserves financial history as "uncategorized"); deleting a category on a *budget* cascades (a budget with no category is meaningless).
- **Recurring transactions use a cursor pattern** (`last_generated`) rather than checking "does this transaction already exist" — a single indexed lookup instead of a scan, and generation runs inside a database transaction so the insert + cursor update either both succeed or both roll back.
- **Aggregation (dashboard stats) happens in SQL**, not in JavaScript after fetching raw rows — scales properly regardless of transaction volume.
- **Row-level authorization on every query** — every model function scopes by `user_id`, not just on create. A user requesting another user's resource by ID gets a 404, not someone else's data.

## Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your MySQL credentials + a JWT secret
npx knex migrate:latest
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## What I'd Add With More Time

- Refresh tokens (currently access-token-only for simplicity)
- Automated tests (Jest/Supertest on the API)
- A real scheduled job (e.g. `node-cron`) for recurring generation, instead of the manual "Run Generation" trigger used for demo purposes
- CSV export of transactions
- Multi-currency support
