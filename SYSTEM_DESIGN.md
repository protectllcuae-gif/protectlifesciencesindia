# Protect Life Sciences System Design

## Overview
This project is a monorepo for a UAE-based ecommerce experience focused on premium gummy products for Protect Life Sciences.

## Architecture

- `client/`
  - Vite + React frontend
  - Firebase Auth for user authentication
  - Firestore for product catalog, admin access, customer and client profiles
  - UI pages include home, shop, product detail, login/signup, client login/signup, dashboards, and admin dashboard

- `server/`
  - Express server serves the built React application from `client/dist`
  - Local SQLite/Turso fallback data access is available under `server/db`
  - This server is used primarily for production deployment and static asset delivery

- `scripts/`
  - Admin and migration helpers for Firestore management
  - Load testing helper for performance validation

## Workflow

1. Developer runs `npm run install:all` to install root, client, and server dependencies.
2. `npm run start:client` launches the React development server.
3. `npm run build:client` compiles the frontend into `client/dist`.
4. `npm start` launches the Express server to serve the production build.

## Data model

- `products` collection
  - Fields: `name`, `slug`, `short_description`, `full_description`, `ingredients`, `benefits`, `price`, `image_url`, `category`, `is_featured`

- `admins` collection
  - Existence of `/admins/{uid}` grants admin privileges

- `customers` collection
  - Stores customer email, role, and signup metadata

- `clients` collection
  - Stores client email, role, and signup metadata

## Authentication

- Customer and client sign-up flows create Firebase Auth users through email/password and store profile metadata in Firestore.
- Google sign-in is available for quick authentication.
- Admin dashboard requires an admin record to exist in Firestore.

## Testing strategy

- **Unit tests** validate individual React components and UI rendering.
- **Integration tests** cover multi-component workflows such as the admin dashboard and auth page behavior.
- **Load testing** validates production response performance for the site.

## Testing commands

- `npm --prefix client run test` — run all frontend tests
- `npm --prefix client run test:unit` — run unit tests only
- `npm --prefix client run test:integration` — run integration tests only
- `npm --prefix client run test:coverage` — generate client coverage report
- `npm run load-test` — run the local load test against `http://localhost:3000`

## Production readiness

- React app is built with Vite and served statically by Express.
- Firebase environment variables are loaded from the repo root via `client/vite.config.js`.
- Admin dashboard provides CRUD product management and analytics counts.
- The `scripts/load-test.js` helper provides a lightweight way to validate production throughput.
