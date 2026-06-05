'use client';

import { useState, useMemo } from 'react';
import styles from './ApiEndpoint.module.css';

type Param = {
  name: string;
  in: 'query' | 'path' | 'header' | 'body';
  type: 'string' | 'integer' | 'number' | 'boolean';
  required: boolean;
  description: string;
  example?: string;
};

type Response = {
  status: number;
  description: string;
  example: string;
};

type Props = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description?: string;
  params?: Param[];
  responses: Response[];
  defaultHeaders?: Record<string, string>;
};

const methodColors: Record<Props['method'], string> = {
  GET: 'var(--vp-api-get, #10b981)',
  POST: 'var(--vp-api-post, #3b82f6)',
  PUT: 'var(--vp-api-put, #f59e0b)',
  DELETE: 'var(--vp-api-delete, #ef4444)',
  PATCH: 'var(--vp-api-patch, #8b5cf6)',
};

export function ApiEndpoint({
  method,
  path,
  summary,
  description,
  params = [],
  responses,
  defaultHeaders = {},
}: Props) {
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of params) {
      init[p.name] = p.example ?? '';
    }
    for (const [k, v] of Object.entries(defaultHeaders)) {
      init[`__header__${k}`] = v;
    }
    return init;
  });

  const [showExample, setShowExample] = useState(false);

  const builtUrl = useMemo(() => {
    const query = params
      .filter((p) => p.in === 'query' && paramValues[p.name])
      .map(
        (p) =>
          `${encodeURIComponent(p.name)}=${encodeURIComponent(
            paramValues[p.name],
          )}`,
      )
      .join('&');

    let p = path;
    for (const param of params.filter((pp) => pp.in === 'path')) {
      p = p.replace(`{${param.name}}`, paramValues[param.name] ?? '');
    }

    return query ? `${p}?${query}` : p;
  }, [path, params, paramValues]);

  const builtHeaders = useMemo(() => {
    const out: Record<string, string> = { ...defaultHeaders };
    for (const p of params.filter((pp) => pp.in === 'header')) {
      out[p.name] = paramValues[p.name];
    }
    return out;
  }, [params, paramValues, defaultHeaders]);

  const builtBody = useMemo(() => {
    const bodyParams = params.filter((p) => p.in === 'body');
    if (bodyParams.length === 0) return null;
    const obj: Record<string, unknown> = {};
    for (const p of bodyParams) {
      const v = paramValues[p.name];
      if (p.type === 'integer' || p.type === 'number') {
        obj[p.name] = v === '' ? null : Number(v);
      } else if (p.type === 'boolean') {
        obj[p.name] = v === 'true';
      } else {
        obj[p.name] = v;
      }
    }
    return obj;
  }, [params, paramValues]);

  return (
    <div className={styles.endpoint}>
      <div className={styles.header}>
        <span
          className={styles.method}
          style={{ backgroundColor: methodColors[method] }}
        >
          {method}
        </span>
        <code className={styles.path}>{builtUrl}</code>
      </div>

      <p className={styles.summary}>{summary}</p>
      {description && <p className={styles.description}>{description}</p>}

      {params.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Parameters</h4>
          <div className={styles.params}>
            {params.map((p) => (
              <div key={p.name} className={styles.param}>
                <label className={styles.paramLabel}>
                  <span className={styles.paramName}>
                    {p.name}
                    {p.required && (
                      <span className={styles.required} title="Required">
                        *
                      </span>
                    )}
                    <span className={styles.paramMeta}>
                      {p.in} · {p.type}
                    </span>
                  </span>
                  <span className={styles.paramDesc}>{p.description}</span>
                </label>
                <input
                  className={styles.paramInput}
                  type={
                    p.type === 'integer' || p.type === 'number'
                      ? 'number'
                      : 'text'
                  }
                  value={paramValues[p.name] ?? ''}
                  onChange={(e) =>
                    setParamValues((prev) => ({
                      ...prev,
                      [p.name]: e.target.value,
                    }))
                  }
                  placeholder={p.example ?? p.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Request</h4>
        <pre className={styles.codeBlock}>
          {method} {builtUrl}
          {Object.entries(builtHeaders).map(([k, v]) => (
            <div key={k}>
              {k}: {v}
            </div>
          ))}
          {builtBody !== null && (
            <code className={styles.json}>{JSON.stringify(builtBody, null, 2)}</code>
          )}
        </pre>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Responses</h4>
        {responses.map((r) => (
          <details
            key={r.status}
            className={styles.response}
            open={r.status === responses[0].status}
          >
            <summary>
              <span
                className={styles.status}
                data-status={Math.floor(r.status / 100)}
              >
                {r.status}
              </span>
              <span className={styles.responseDesc}>{r.description}</span>
            </summary>
            <pre className={styles.codeBlock}>
              <code className={styles.json}>{r.example}</code>
            </pre>
          </details>
        ))}
      </div>
    </div>
  );
}
