import React, { useEffect, useState } from 'react';
import { getSupabaseProjectId } from '../utils/supabase/env';

type Check = {
  name: string;
  path: string; // path after the function base
  method?: 'GET' | 'POST';
  body?: any;
};

export default function IntegrationTestPage() {
  const [results, setResults] = useState<Record<string, { ok: boolean; status: number; data?: any; error?: string }>>({});
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    try { setProjectId(getSupabaseProjectId()); } catch {}
  }, []);

  const base = projectId ? `https://${projectId}.supabase.co/functions/v1/make-server-f0b2daa4` : '';
  const checks: Check[] = [
    { name: 'health-clean', path: '/health' }, // clean URL, wrapper will normalize
    { name: 'health-prefixed', path: '/make-server-f0b2daa4/health' },
    { name: 'deploy-status', path: '/deploy/status' },
    { name: 'retreats-health', path: '/retreats/health' },
  ];

  const runChecks = async () => {
    // Try to include an access token if the user is logged in
    let authHeader: Record<string, string> = {};
    try {
      const { supabase } = await import('../utils/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeader = { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {}
    const out: typeof results = {};
    for (const c of checks) {
      try {
        const url = `${base}${c.path}`;
        const res = await fetch(url, {
          method: c.method || 'GET',
          headers: { 'content-type': 'application/json', ...authHeader },
          body: c.body ? JSON.stringify(c.body) : undefined,
        });
        const text = await res.text();
        let data: any = undefined;
        try { data = JSON.parse(text); } catch { data = text; }
        out[c.name] = { ok: res.ok, status: res.status, data };
      } catch (e: any) {
        out[c.name] = { ok: false, status: 0, error: e?.message || String(e) };
      }
    }
    setResults(out);
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto', fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Supabase Edge Function Integration Test</h1>
      <p style={{ color: '#555' }}>Project: {projectId || '(not set)'} | Function: make-server-f0b2daa4</p>

      <button onClick={runChecks} style={{ margin: '12px 0', padding: '8px 14px', borderRadius: 8, background: '#111', color: '#fff' }}>
        Run Checks
      </button>

      <div style={{ display: 'grid', gap: 12 }}>
        {Object.entries(results).map(([k, v]) => (
          <div key={k} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{k}</strong>
              <span style={{ color: v.ok ? 'green' : 'crimson' }}>{v.ok ? 'OK' : 'FAIL'} (status {v.status})</span>
            </div>
            <pre style={{ marginTop: 8, background: '#f9f9f9', padding: 10, borderRadius: 6, overflowX: 'auto' }}>
{typeof v.data === 'string' ? v.data : JSON.stringify(v.data, null, 2)}
            </pre>
            {v.error && (
              <pre style={{ marginTop: 8, background: '#fff6f6', padding: 10, borderRadius: 6, color: '#a00', overflowX: 'auto' }}>
{v.error}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
