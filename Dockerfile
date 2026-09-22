FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
WORKDIR /workspace
COPY frontendgabay/package.json frontendgabay/pnpm-lock.yaml frontendgabay/pnpm-workspace.yaml ./frontendgabay/
WORKDIR /workspace/frontendgabay
RUN --mount=type=cache,id=gabay-pnpm-store,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --ignore-scripts --fetch-timeout=300000 --network-concurrency=8
WORKDIR /workspace
COPY backendgabay/packages ./backendgabay/packages
COPY frontendgabay ./frontendgabay
WORKDIR /workspace/frontendgabay
ENV API_URL=http://api:4000
ENV NEXT_TELEMETRY_DISABLED=1
RUN node node_modules/next/dist/bin/next build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /workspace/frontendgabay/.next/standalone ./
COPY --from=build --chown=node:node /workspace/frontendgabay/.next/static ./frontendgabay/.next/static
COPY --from=build --chown=node:node /workspace/frontendgabay/public ./frontendgabay/public
USER node
EXPOSE 3000
CMD ["node", "frontendgabay/server.js"]
