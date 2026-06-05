# ---- Stage 1: build ----
# We build the static export in a single stage but split the result into
# a tiny runtime image that serves the static files. This is the
# standard Nextra 3 pattern for fully-statically-exported docs.

FROM node:20-alpine AS builder
WORKDIR /app

# Install only what's needed for the build, then re-run with the full
# tree. A clean `npm ci` is faster than `npm install` because it uses
# the lockfile directly.
COPY package.json package-lock.json* ./
RUN npm ci

# Bring in the rest of the source. The .dockerignore trims node_modules
# and .next at the host side.
COPY . .

# next.config.js has `output: 'export'`, so `next build` produces
# `out/` with the static site. We don't need a Next server.
RUN npm run build

# ---- Stage 2: serve ----
# A 7 MB nginx image is the right tool. It supports HTTP/2, gzip, and
# the immutable-cache headers we set in nginx.conf.
FROM nginx:1.27-alpine AS runner

# Drop the default config; use ours.
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck is what the orchestrator will use.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
