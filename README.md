# GABAY Web

Next.js App Router interface for the GABAY teaching workspace. Route files under `src/app` compose feature screens; interactive behavior lives in `src/features`. Shared UI primitives and the cookie-based API client live in `src/shared`.

Use the [setup guide](../backendgabay/docs/setup.md) and [architecture guide](../backendgabay/docs/architecture.md). Keep this repository beside `backendgabay/` inside `gabayai/`; shared TypeScript contracts, compiler settings, and theme tokens live in `../backendgabay/packages/`.

From this `frontendgabay` directory:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

The default browser URL is `http://localhost:3000`. Same-origin `/api` requests are proxied to `http://127.0.0.1:4000`. Set `API_URL` before building if the backend is elsewhere; Docker builds use `http://api:4000`.

Validation: `pnpm lint` and `pnpm build`. API keys, database credentials, and authoritative business calculations belong to the NestJS backend.
