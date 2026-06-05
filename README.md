# Vedpragya Streams — API documentation

The public reference for the Vedpragya Streams platform: REST endpoints,
the Socket.IO live gateway, the identifier model, and the patterns we
recommend for building reliable clients.

Source for this site: [github.com/Vedpragya-Bharat/vedpragya-streams-docs](https://github.com/Vedpragya-Bharat/vedpragya-streams-docs).

The site is a fully-statically-exported Nextra 3 site. There is no
server at runtime — just HTML, CSS, and a small amount of JavaScript
for the interactive TryIt boxes and the dark-mode toggle.

## What's in this repo

```
.
├── components/              # Interactive React components (client-side)
│   ├── ApiEndpoint.tsx      #   Renders an endpoint block with editable params
│   ├── ApiEndpoint.module.css
│   ├── TryIt.tsx            #   "Send request" widget
│   └── TryIt.module.css
├── pages/                   # MDX content (one file per page)
│   ├── index.mdx            # Landing page
│   ├── getting-started/     # First 5 minutes
│   ├── authentication/      # Keys, sessions, scopes
│   ├── search/              # /v1/search
│   ├── instruments/         # Catalogue, OHLCV, canonical
│   ├── live-data/           # The WebSocket protocol
│   ├── watchlist/           # Per-user watchlists
│   ├── symbols/             # Symbol formats users type
│   ├── errors/              # Error model and tricky data cases
│   └── reference/           # Field-level endpoint reference
├── theme.config.tsx         # Brand colours, navbar, footer
├── next.config.js           # Nextra 3 + static export
├── Dockerfile               # Multi-stage: build → nginx
├── docker-compose.yml       # Local dev + prod preview
├── nginx.conf               # Long-cache static, security headers
└── package.json
```

## Run locally

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`. Edits to `.mdx` and
`.tsx` hot-reload in the browser.

## Build the static site

```bash
npm run build
```

`next build` with `output: 'export'` produces an `out/` directory with
the complete site. Drop it on any static host.

## Run in Docker

```bash
# dev (hot-reloading Node)
docker compose up docs-dev

# production preview (nginx)
docker compose up docs-build
# → http://localhost:8080
```

## Editing the docs

- **Add a new page.** Create `pages/<section>/<slug>.mdx` and add an
  entry to the corresponding `_meta.json`. Nextra picks the order from
  the meta.
- **Add a new section.** Create `pages/<section>/_meta.json` and add
  the section name to `pages/_meta.json`.
- **Add a new endpoint.** Use the `<ApiEndpoint />` component from
  `components/`. Props are typed and validated at the call site.
- **Add a "Try it" box.** Use the `<TryIt />` component. It calls the
  public API from the browser. CORS and authentication restrictions
  may apply — note the footnote.

## Conventions

- Use ISO-8601 UTC for all timestamps in code samples and JSON.
- Use `<Callout type="info" emoji="🔍">` for asides.
- Use `<Tabs items={['JavaScript', 'Python', 'cURL']}>` for code in
  multiple languages.
- Use a `<Steps>` block for ordered procedures.
- Use a `<Cards>` block for nav grids.
- Don't write `providerToken` anywhere in the public docs. Use
  `UIR id`.

## Deploying

The `Dockerfile` builds the static site and serves it with nginx on
port 80. Push the image to your registry of choice; the runtime image
is ~25 MB compressed.

Behind a CDN:

- `/` and `/*` — short cache (1 min, with `stale-while-revalidate`).
- `/_next/static/*` — long cache (1 year, immutable).

## License

Proprietary. © Vedpragya. Internal use only; redistribution not
permitted without written consent.
