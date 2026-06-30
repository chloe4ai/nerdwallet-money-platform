let BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
// Render's `fromService` injects a bare hostname — normalize to a full URL.
if (BASE && !/^https?:\/\//.test(BASE)) BASE = `https://${BASE}`;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ---- types ----
export type ProfileInput = {
  name?: string; credit_band: string; goal: string; cash_flow: string; debt_type: string; horizon: string;
};
export type Product = {
  id: string; issuer: string; name: string; tagline: string; badge: string; badgeType: string;
  stats: [string, string][]; detail: string[]; applyUrl: string | null; applyLabel: string | null;
};
export type Module = { vertical: string; reason: string; pmLens: { logic: string; metric: string; experiment: string }; product: Product };
export type Plan = {
  profile: { id: string; name: string; creditBand: string; goal: string; cashFlow: string; debtType: string; horizon: string; moneyHealth: number };
  tags: string[]; debtFirst: boolean; modules: Module[];
};

export const api = {
  createProfile: (p: ProfileInput) => http<Plan>('/profiles', { method: 'POST', body: JSON.stringify(p) }),
  getPlan: (id: string) => http<Plan>(`/profiles/${id}`),
  getActions: (id: string) => http<any[]>(`/actions/${id}`),
  saveAction: (b: { profileId: string; productId: string; vertical: string; status: string }) =>
    http<{ ok: boolean; actions: any[] }>('/actions', { method: 'POST', body: JSON.stringify(b) }),
  trackEvent: (b: { profileId?: string | null; segment?: string; type: string; vertical?: string | null }) =>
    http('/events', { method: 'POST', body: JSON.stringify(b) }).catch(() => {}),
  getVerticals: () => http<{ vertical: string; label: string }[]>('/market/verticals'),
  getMarket: (v: string) => http<any>(`/market/${v}`),
  getSegments: () => http<any[]>('/metrics/segments'),
  getFunnel: (seg: string) => http<any>(`/metrics/funnel?segment=${seg}`),
  getKpis: (seg: string) => http<any>(`/metrics/kpis?segment=${seg}`),
  getBaseline: (seg: string) => http<Record<string, number>>(`/metrics/baseline?segment=${seg}`),
  simulate: (segment: string, overrides: Record<string, number>) =>
    http<any>('/metrics/simulate', { method: 'POST', body: JSON.stringify({ segment, overrides }) }),
  getExperiments: () => http<any[]>('/experiments'),
  setDecision: (id: string, decision: string) =>
    http<any>(`/experiments/${id}`, { method: 'PATCH', body: JSON.stringify({ decision }) }),
  getRoadmap: () => http<any>('/metrics/roadmap'),
};
