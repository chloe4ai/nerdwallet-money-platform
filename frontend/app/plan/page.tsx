'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { api, Plan, Module } from '@/lib/api';

const META: Record<string, { kicker: string; title: string; ico: string; bg: string }> = {
  credit: { kicker: 'Consumer Credit', title: 'Your card match', ico: '💳', bg: '#e6f7ed' },
  lending: { kicker: 'Financial Services', title: 'Lending move', ico: '🏦', bg: '#e9f1fe' },
  investing: { kicker: 'Investment Products', title: 'Wealth step', ico: '📈', bg: '#fdf2dd' },
};

export default function PlanPage() {
  const router = useRouter();
  const { profileId, pmLens } = useStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [actions, setActions] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Module | null>(null);
  const [ring, setRing] = useState(0);

  useEffect(() => {
    if (!profileId) { router.replace('/onboarding'); return; }
    api.getPlan(profileId).then((p) => {
      setPlan(p);
      const target = Math.round(((p.profile.moneyHealth - 500) / 320) * 100);
      let c = 0; const t = setInterval(() => { c += 3; if (c >= target) { c = target; clearInterval(t); } setRing(c); }, 12);
    }).catch(() => router.replace('/onboarding'));
    api.getActions(profileId).then((rows) => {
      const m: Record<string, string> = {}; rows.forEach((r) => (m[r.product_id] = r.status)); setActions(m);
    }).catch(() => {});
  }, [profileId, router]);

  async function act(mod: Module, status: 'saved' | 'applied') {
    if (!profileId) return;
    const r = await api.saveAction({ profileId, productId: mod.product.id, vertical: mod.vertical, status });
    const m: Record<string, string> = {}; r.actions.forEach((x: any) => (m[x.product_id] = x.status)); setActions(m);
  }
  function openDetail(mod: Module) {
    setOpen(mod);
    api.trackEvent({ profileId, type: 'click_reco', vertical: mod.vertical });
  }

  if (!plan) return <div className="py-20 text-center text-muted">Loading your plan…</div>;

  return (
    <div className="fade py-7">
      {pmLens && (
        <div className="bg-gradient-to-r from-nw-dark to-nw-darker text-[#d8f3e4] rounded-2xl px-5 py-4 text-[13.5px] mb-2 flex gap-3 items-center">
          🎯 <span><b>North Star — Activated Members:</b> share completing ≥1 recommended action within 30 days. Each module is a lever; the PM-lens notes show the personalization logic, the metric it moves, and the live experiment.</span>
        </div>
      )}
      <div className="flex gap-6 items-center flex-wrap py-6">
        <div className="score-ring" style={{ ['--p' as any]: ring }}>
          <div className="inner"><div><div className="text-[34px] font-black leading-none">{plan.profile.moneyHealth}</div><div className="text-[10.5px] text-muted font-semibold">MONEY HEALTH</div></div></div>
        </div>
        <div>
          <h2 className="text-[25px] font-bold mb-1">Your personalized plan</h2>
          <p className="text-muted text-[15px] max-w-[540px]">{plan.debtFirst
            ? "You're carrying high-interest debt, so we sequenced the plan to kill that first — then build and grow."
            : "Here's your prioritized plan across credit, lending, and investing — tuned to your profile, goal, and time horizon."}</p>
          <div className="flex gap-2 mt-2.5 flex-wrap">{plan.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        </div>
      </div>

      <div className="grid gap-4 mb-4">
        {plan.modules.map((m) => {
          const meta = META[m.vertical]; const st = actions[m.product.id];
          return (
            <div key={m.vertical} className="card p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl grid place-items-center text-lg" style={{ background: meta.bg }}>{meta.ico}</div>
                <div><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-faint">{meta.kicker}</div><h3 className="text-[19px] font-bold">{meta.title}</h3></div>
              </div>
              <div className="mt-4 border border-line rounded-xl p-4 flex gap-4 items-start">
                <div className="flex-1">
                  <p className="font-bold text-[16.5px] mb-0.5">{m.product.name}</p>
                  <p className="text-[13.5px] text-muted">{m.product.tagline}</p>
                  <div className="flex gap-6 mt-3.5 flex-wrap">
                    {m.product.stats.map(([l, v]) => <div key={l} className="text-[13px] text-muted"><b className="block text-[18px] text-ink">{v}</b>{l}</div>)}
                  </div>
                </div>
                <span className={`badge b-${m.product.badgeType}`}>{m.product.badge}</span>
              </div>
              <div className="text-[12.5px] bg-nw-mint text-nw-dark rounded-lg px-3 py-2.5 mt-3.5 flex gap-2 leading-snug">✨ <span>{m.reason}</span></div>

              <div className="flex gap-2.5 mt-3.5 flex-wrap items-center">
                <button onClick={() => openDetail(m)} className="border-[1.5px] border-nw-green text-nw-dark font-bold text-[13.5px] px-4 py-2 rounded-lg hover:bg-nw-mint transition">
                  View details &amp; {m.product.applyUrl ? 'apply' : 'why'} →
                </button>
                <button onClick={() => act(m, 'saved')} className={`text-[13.5px] font-bold px-4 py-2 rounded-lg border-[1.5px] transition ${st === 'saved' ? 'border-bluenw bg-bluebg text-bluenw' : 'border-line text-muted hover:border-[#a9c2b6]'}`}>
                  {st === 'saved' ? '✓ Saved' : 'Save for later'}
                </button>
                <button onClick={() => act(m, 'applied')} className={`text-[13.5px] font-bold px-4 py-2 rounded-lg border-[1.5px] transition ${st === 'applied' ? 'border-nw-green bg-nw-mint text-nw-dark' : 'border-line text-muted hover:border-[#a9c2b6]'}`}>
                  {st === 'applied' ? '✓ Activated' : 'Mark as done'}
                </button>
              </div>

              {pmLens && (
                <div className="mt-3.5 bg-[#f3faf6] border border-dashed border-[#b9dcca] rounded-xl px-4 py-3 text-[12.5px] text-[#36493f]">
                  <div className="text-[10px] font-black uppercase tracking-wide text-nw-dark mb-1.5">PM lens · {meta.kicker}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div><b>Personalization logic:</b> {m.pmLens.logic}</div>
                    <div><b>Metric it moves:</b> {m.pmLens.metric}</div>
                    <div className="sm:col-span-2"><b>Experiment:</b> {m.pmLens.experiment}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center"><button onClick={() => router.push('/onboarding')} className="text-muted text-sm underline">↺ Start over with a different profile</button></div>

      {open && (
        <div className="fixed inset-0 bg-[rgba(16,30,24,.55)] backdrop-blur-sm flex items-start justify-center z-50 p-10 overflow-auto fade" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="bg-white rounded-2xl max-w-[540px] w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-6 bg-gradient-to-br from-nw-dark to-nw-darker text-white relative">
              <button onClick={() => setOpen(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white text-lg">×</button>
              <div className="text-[11.5px] font-bold opacity-80 uppercase tracking-wide">{META[open.vertical].kicker} · {open.product.issuer}</div>
              <h3 className="text-[23px] font-bold mt-1 text-white">{open.product.name}</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-muted text-[14.5px] mb-3.5">{open.product.tagline}</p>
              {open.product.detail.map((d, i) => (
                <div key={i} className="flex gap-2.5 py-2.5 border-b border-line last:border-0 text-sm"><span className="text-nw-green font-extrabold">✓</span><span>{d}</span></div>
              ))}
            </div>
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              {open.product.applyUrl && (
                <a href={open.product.applyUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-nw-green text-white font-bold text-[15.5px] py-3.5 rounded-xl hover:bg-nw-dark transition">
                  {open.product.applyLabel}
                </a>
              )}
              <div className="text-[11px] text-faint text-center leading-relaxed">Rates &amp; offers current as of June 2026 and may change — confirm details on the issuer&apos;s site. Terms apply.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
