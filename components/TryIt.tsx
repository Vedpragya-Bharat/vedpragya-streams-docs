'use client';

import { useState } from 'react';
import styles from './TryIt.module.css';

type Param = {
  name: string;
  label?: string;
  default?: string;
  placeholder?: string;
};

type Props = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  apiKeyHint?: string;
  params?: Param[];
  description?: string;
};

export function TryIt({ method, url, apiKeyHint, params = [], description }: Props) {
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of params) {
      init[p.name] = p.default ?? '';
    }
    return init;
  });

  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState<{
    status: number;
    body: string;
    durationMs: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBodyMethod = method === 'POST' || method === 'PUT' || method === 'DELETE';

  async function run() {
    setLoading(true);
    setError(null);
    setResponse(null);

    const start = performance.now();

    try {
      // Build URL with query params for GET, or body for POST/PUT
      let finalUrl = url;
      const init: RequestInit = {
        method,
        headers: {
          'x-api-key': apiKey || 'YOUR_API_KEY',
          'Content-Type': 'application/json',
        },
      };

      if (method === 'GET') {
        const query = params
          .filter((p) => paramValues[p.name])
          .map(
            (p) =>
              `${encodeURIComponent(p.name)}=${encodeURIComponent(
                paramValues[p.name],
              )}`,
          )
          .join('&');
        if (query) finalUrl += (url.includes('?') ? '&' : '?') + query;
      } else {
        const body: Record<string, unknown> = {};
        for (const p of params) {
          const v = paramValues[p.name];
          if (!v) continue;
          body[p.name] = v.includes(',') ? v.split(',').map((s) => Number(s.trim())) : v;
        }
        init.body = JSON.stringify(body);
      }

      const r = await fetch(finalUrl, init);
      const text = await r.text();
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // not JSON
      }

      setResponse({
        status: r.status,
        body: formatted,
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.tryIt}>
      <div className={styles.bar}>
        <span className={styles.method} data-method={method}>
          {method}
        </span>
        <code className={styles.url}>{url}</code>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.controls}>
        <label className={styles.field}>
          <span className={styles.label}>x-api-key</span>
          <input
            className={styles.input}
            type="password"
            placeholder={apiKeyHint ?? 'vk_live_...'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>

        {params.map((p) => (
          <label key={p.name} className={styles.field}>
            <span className={styles.label}>
              {p.label ?? p.name}
              {isBodyMethod && p.name === 'instruments' ? ' (comma-separated)' : ''}
            </span>
            <input
              className={styles.input}
              type="text"
              placeholder={p.placeholder ?? p.default ?? ''}
              value={paramValues[p.name]}
              onChange={(e) =>
                setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))
              }
            />
          </label>
        ))}

        <button
          className={styles.runButton}
          onClick={run}
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send request'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Network error:</strong> {error}
          <p className={styles.errorHint}>
            The request was sent from your browser. If the platform is on
            a different origin than the docs site, the browser's CORS
            policy will block the response. The CORS-friendly path is to
            use the request from your own backend, or from the CLI with
            curl.
          </p>
        </div>
      )}

      {response && (
        <div className={styles.response}>
          <div className={styles.responseHeader}>
            <span
              className={styles.status}
              data-status={Math.floor(response.status / 100)}
            >
              {response.status}
            </span>
            <span className={styles.duration}>{response.durationMs} ms</span>
          </div>
          <pre className={styles.body}>
            <code>{response.body}</code>
          </pre>
        </div>
      )}

      <p className={styles.footnote}>
        Note: this runs in your browser. CORS and authentication
        restrictions may apply — for unrestricted testing, use curl from
        the CLI.
      </p>
    </div>
  );
}
