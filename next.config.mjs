// Nextra 3 alpha is ESM-only. CJS `next.config.js` is no longer
// supported; the project must be `type: "module"` or this file
// must be `next.config.mjs`. We use the latter so the rest of the
// project (theme.config.tsx, .ts components) keeps its TS happy.

import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  search: {
    placeholder: 'Search the docs…',
  },
  staticImage: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static export — the Dockerfile just serves the resulting
  // `out/` directory with nginx, no Node server in the image.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Subpath: the docs site is mounted at
  // https://marketdata.vedpragya.com/docs/. basePath rewrites all
  // internal links and `assetPrefix` rewrites every `_next/...` and
  // static asset URL so the build is portable to any subpath without
  // touching MDX.
  basePath: '/docs',
  assetPrefix: '/docs',
  // Caching tweaks so the production build is fast on rebuilds.
  experimental: {
    optimizePackageImports: ['nextra', 'nextra-theme-docs'],
  },
  // Don't fail the build on lint warnings; we lint separately.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default withNextra(nextConfig);
