import React from 'react';
import { useRouter } from 'next/router';
import type { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: (
    <span
      style={{
        fontWeight: 700,
        fontSize: '1.05rem',
        letterSpacing: '-0.01em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 22,
          height: 22,
          borderRadius: 6,
          background:
            'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,.2)',
        }}
      />
      <span>Vedpragya&nbsp;Streams</span>
    </span>
  ),
  project: {
    link: 'https://github.com/Vedpragya-Bharat/vedpragya-streams-docs',
  },
  chat: {
    link: 'mailto:streams-support@vedpragya.com',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z" />
      </svg>
    ),
  },
  docsRepositoryBase:
    'https://github.com/Vedpragya-Bharat/vedpragya-streams-docs/blob/main',
  editLink: {
    content: 'Edit this page on GitHub →',
  },
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/') {
      return { titleTemplate: '%s – Vedpragya Streams' };
    }
    return { titleTemplate: 'Vedpragya Streams – Market data, made for builders' };
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="description"
        content="A modern real-time market data API. Search instruments, stream live ticks over WebSocket, build watchlists in minutes."
      />
      <meta property="og:title" content="Vedpragya Streams" />
      <meta
        property="og:description"
        content="Real-time market data API for builders. Search instruments, stream live ticks, build watchlists."
      />
      <meta property="og:type" content="website" />
      <link
        rel="icon"
        type="image/svg+xml"
        href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%236366f1'/%3E%3Cstop offset='1' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='url(%23g)'/%3E%3Cpath d='M8 22V10h2v12H8zm5-3v-9h2v9h-2zm5 3v-6h2v6h-2z' fill='white'/%3E%3C/svg%3E"
      />
    </>
  ),
  banner: {
    key: 'streams-1.0',
    dismissible: true,
    text: (
      <a href="/getting-started">
        🎉 Streams 1.0 is live — see the getting-started guide →
      </a>
    ),
  },
  sidebar: {
    titleComponent: ({ title, type }) =>
      type === 'separator' ? (
        <span style={{ opacity: 0.6 }}>{title}</span>
      ) : (
        <>{title}</>
      ),
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  primaryHue: { light: 232, dark: 192 },
  primarySaturation: { light: 80, dark: 80 },
  navigation: {
    prev: true,
    next: true,
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system',
    storageKey: 'streams-theme',
  },
  footer: {
    text: (
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span>
          © {new Date().getFullYear()} Vedpragya · All rights reserved
        </span>
        <span style={{ opacity: 0.7 }}>
          Made for builders. The backend is private; the data is yours.
        </span>
      </div>
    ),
  },
  codeHighlight: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
  // i18n comes later if needed; leave default for now.
  i18n: [],
};

export default config;
