# Protect Life Sciences — Monorepo

Structure

- server/ — Node/Express server that serves the built React client
- client/ — Vite + React frontend
- scripts/ — helper scripts (migration, add-admin)
- client/public/ — static assets and product images

Quick start

1. Create a `.env` file in the repo root and set Firebase config values plus `FIREBASE_SERVICE_ACCOUNT_PATH` for admin scripts. The React app is configured to load env vars from the repo root.
2. Install dependencies for the root, client, and server:

```bash
npm run install:all
```

3. Run the React dev app:

```bash
npm run start:client
```

4. Build the client and start the production server:

```bash
npm run build:client
npm start
```

Helpful scripts

- `npm run migrate:products` — migrate seed products into Firestore (requires service account)
- `npm run add:admin -- <uid>` — create `/admins/{uid}` document to grant admin access
- `npm run load-test` — run a simple load test against `http://localhost:3000`

Testing

- `npm --prefix client run test` — run all Vitest tests in the client app
- `npm --prefix client run test:unit` — run frontend unit tests
- `npm --prefix client run test:integration` — run frontend integration tests
- `npm --prefix client run test:coverage` — generate client test coverage

Test files live in `client/src/__tests__/` and cover component rendering, shop data loading, and admin workflow behavior.

