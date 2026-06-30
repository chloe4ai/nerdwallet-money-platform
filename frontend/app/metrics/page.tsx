'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const SEG_KEYS = ['new', 'ret'];
const STEPS: [string, string][] = [['profile', 'Profile completion'], ['click', 'Recommendation click'], ['activate', 'Action completion']];
const VMAP: Record<string, [string, string]> = { credit: ['CREDIT', 'b-green'], lending: ['LENDING', 'b-blue'], investing: ['WEALTH', 'b-amber'] };

export default function MetricsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [seg, setSeg] = useState('new');
  const [baseline, setBaseline] = useState<Record<string, number> | null>(null);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [sim, setSim] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [openAb, setOpenAb] = useState<string | null>(null);
  const [roadFilter, setRoadFilter] = useState('all');
  const [openRoad, setOpenRoad] = useState<string | null>(null);

  useEffect(() => { api.getSegments().then(setSegments).catch(() => {}); api.getExperiments().then(setExperiments).catch(() => {}); api.getRoadmap().then(setRoadmap).catch(() => {}); }, []);

  // load a segment: pull baseline + kpis, reset sliders to baseline, simulate
  useEffect(() => {
    (async () => {
      const [b, k] = await Promise.all([api.getBaseline(seg), api.getKpis(seg)]);
      setBaseline(b); setKpis(k);
      const init = { profile: b.profile, click: b.click, activate: b.activate };
      setOverrides(init);
      setSim(await api.simulate(seg, init));
    })().catch(() => {});
  }, [seg]);

  const runSim = useCallback(async (ov: Record<string, number>) => { setSim(await api.simulate(seg, ov)); }, [seg]);

  function onSlide(step: string, pct: number) {
    const ov = { ...overrides, [step]: pct / 100 }; setOverrides(ov); runSim(ov);
  }
  function applyLever(exp: any) {
    if (!baseline || !exp.lever) return;
    const nv = Math.min(0.99, baseline[exp.lever.step] * exp.lever.mult);
    const ov = { ...overrides, [exp.lever.step]: nv }; setOverrides(ov); runSim(ov);
    document.getElementById('funnel-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function decide(id: string, decision: string) {
    const updated = await api.setDecision(id, decision);
    setExperiments((xs) => xs.map((x) => (x.id === id ? updated : x)));
  }

  const delta = (cls: number) => (cls > 0 ? 'text-nw-dark' : cls < 0 ? 'text-rednw' : 'text-faint');
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="fade py-7">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-3">
        <div><h2 className="text-[25px] font-bold">Live in the numbers</h2>
          <p className="text-muted text-[14.5px] max-w-[560px]">Switch segments, then drag the funnel levers — the backend recomputes activated members and revenue from the real event stream.</p></div>
        <span className="pill">PERFORMANCE</span>
      </div>

      {/* segment toggle */}
      <div className="inline-flex gap-1 bg-[#eef3f0] p-1 rounded-xl mb-3.5">
        {segments.map((s) => (
          <button key={s.segment} onClick={() => setSeg(s.segment)}
            className={`text-[13px] font-semibold px-4 py-1.5 rounded-lg ${seg === s.segment ? 'bg-white text-nw-dark shadow-sm' : 'text-muted'}`}>{s.label}</button>
        ))}
      </div>

      {/* KPIs */}
      {kpis && sim && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => { const d = sim.activationRate - kpis.activation; return (
            <div className="card p-5"><div className="text-xs text-muted font-semibold">Activated members (30d)</div><div className="text-[30px] font-black tracking-tight my-1.5">{sim.activationRate}%</div><div className={`text-[12.5px] font-bold ${d >= 0 ? 'text-nw-dark' : 'text-rednw'}`}>{d >= 0 ? '▲' : '▼'} {Math.abs(d).toFixed(1)} pts vs baseline</div></div>
          ); })()}
          <div className="card p-5"><div className="text-xs text-muted font-semibold">Card application CVR</div><div className="text-[30px] font-black tracking-tight my-1.5">{kpis.cardCvr}%</div><div className={`text-[12.5px] font-bold ${kpis.cardDelta[0] === '+' ? 'text-nw-dark' : 'text-rednw'}`}>{kpis.cardDelta[0] === '+' ? '▲' : '▼'} {kpis.cardDelta.slice(1)} pts</div></div>
          <div className="card p-5"><div className="text-xs text-muted font-semibold">Lending lead → partner</div><div className="text-[30px] font-black tracking-tight my-1.5">{kpis.lendLead}%</div><div className={`text-[12.5px] font-bold ${kpis.lendDelta[0] === '+' ? 'text-nw-dark' : 'text-rednw'}`}>{kpis.lendDelta[0] === '+' ? '▲' : '▼'} {kpis.lendDelta.slice(1)} pts</div></div>
          <div className="card p-5"><div className="text-xs text-muted font-semibold">Revenue / active user</div><div className="text-[30px] font-black tracking-tight my-1.5">${kpis.rpu.toFixed(2)}</div><div className="text-[12.5px] font-bold text-nw-dark">▲ {kpis.rpuDelta}</div></div>
        </div>
      )}

      {/* funnel + simulator */}
      {sim && baseline && (
        <div id="funnel-card" className="card p-6 mt-4">
          <h3 className="text-[17px] font-bold mb-4">Activation funnel — drag levers to simulate <span className="font-semibold text-muted text-[13px]">· {segments.find((s) => s.segment === seg)?.label} · {fmt(sim.start)} entering</span></h3>
          {sim.counts.map((c: any) => (
            <div key={c.key} className="flex items-center gap-3.5 mb-2.5">
              <div className="w-[180px] text-[13.5px] font-semibold shrink-0">{c.label}</div>
              <div className="fbar-track flex-1"><div className="fbar" style={{ width: `${c.pct}%` }}>{c.pct}%</div></div>
              <div className="w-[120px] text-[12.5px] text-muted text-right shrink-0">{c.leak ? <b className="text-rednw">↓ biggest leak</b> : fmt(c.n)}</div>
            </div>
          ))}
          <div className="grid md:grid-cols-2 gap-6 mt-5 border-t border-line pt-5">
            <div>
              <div className="text-[11.5px] font-extrabold uppercase tracking-wide text-muted mb-3">What-if levers</div>
              {STEPS.map(([step, label]) => { const v = Math.round((overrides[step] ?? baseline[step]) * 100); return (
                <div key={step} className="mb-4">
                  <div className="flex justify-between text-[13px] mb-1"><span>{label}</span><b className="text-nw-dark">{v}%</b></div>
                  <input type="range" min={30} max={99} value={v} onChange={(e) => onSlide(step, +e.target.value)} className="w-full cursor-pointer" />
                </div>
              ); })}
              <button onClick={() => { const init = { profile: baseline.profile, click: baseline.click, activate: baseline.activate }; setOverrides(init); runSim(init); }} className="text-muted text-[12.5px] underline">↺ Reset to baseline</button>
            </div>
            <div>
              <div className="text-[11.5px] font-extrabold uppercase tracking-wide text-muted mb-3">Projected impact</div>
              <div className="bg-[#f3faf6] border border-[#cfe7da] rounded-xl px-5 py-4">
                <div className="text-[36px] font-black tracking-tighter leading-none">{fmt(sim.activated)}</div>
                <div className="text-xs text-muted mb-3">activated members / mo · {sim.activationRate}% of entrants</div>
                <div className="flex justify-between text-[13.5px] py-2 border-b border-dashed border-[#cfe7da]"><span>vs. baseline</span><span className={`font-extrabold ${delta(sim.deltaMembers)}`}>{sim.deltaMembers >= 0 ? '+' : ''}{fmt(sim.deltaMembers)} members</span></div>
                <div className="flex justify-between text-[13.5px] py-2 border-b border-dashed border-[#cfe7da]"><span>Monthly revenue</span><b>${fmt(sim.monthlyRevenue)}</b></div>
                <div className="flex justify-between text-[13.5px] py-2 border-b border-dashed border-[#cfe7da]"><span>Revenue delta</span><span className={`font-extrabold ${delta(sim.deltaRevenueMonthly)}`}>{sim.deltaRevenueMonthly >= 0 ? '+' : '−'}${fmt(Math.abs(sim.deltaRevenueMonthly))}/mo</span></div>
                <div className="flex justify-between text-[13.5px] py-2"><span>Annualized</span><span className={`font-extrabold ${delta(sim.deltaRevenueAnnual)}`}>{sim.deltaRevenueAnnual >= 0 ? '+' : '−'}${fmt(Math.abs(sim.deltaRevenueAnnual))}/yr</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* experiments */}
      <div className="mt-8 mb-3"><h2 className="text-[25px] font-bold">Experiments in flight</h2><p className="text-muted text-[14.5px]">Click a test to expand. Winning tests push their measured lift straight into the simulator above; decisions persist to the backend.</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        {experiments.map((t) => (
          <div key={t.id} className="card p-5 cursor-pointer" onClick={() => setOpenAb(openAb === t.id ? null : t.id)}>
            <div className="flex justify-between items-center mb-1"><span className="font-bold text-[15px]">{t.name}</span><span className={`badge b-${t.statusType}`}>{t.status}{t.decision ? ` · ${t.decision}` : ''}</span></div>
            <p className="text-[13px] text-muted">{t.hypothesis}</p>
            <div className="flex gap-[18px] mt-3">{t.results.map((r: any, i: number) => <div key={i} className="text-xs text-muted"><b className="block text-[19px] text-ink">{r[0]}</b>{r[1]}</div>)}</div>
            {openAb === t.id && (
              <div className="mt-3 border-t border-dashed border-line pt-3 text-[13px] text-muted leading-relaxed fade">
                {t.detail}
                {t.lever && <div><button onClick={(e) => { e.stopPropagation(); applyLever(t); }} className="mt-2.5 bg-nw-green text-white rounded-lg px-3.5 py-2 text-[12.5px] font-bold hover:bg-nw-dark">▲ {t.lever.label}</button></div>}
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {['ship', 'iterate', 'kill'].map((d) => (
                    <button key={d} onClick={(e) => { e.stopPropagation(); decide(t.id, d); }}
                      className={`border-[1.5px] rounded-lg px-3 py-1.5 text-[12.5px] font-bold ${t.decision === d ? 'border-nw-green bg-nw-mint text-nw-dark' : 'border-line text-muted'}`}>{d[0].toUpperCase() + d.slice(1)}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* roadmap */}
      <div className="flex items-end justify-between gap-4 flex-wrap mt-8 mb-3">
        <div><h2 className="text-[25px] font-bold">Roadmap</h2><p className="text-muted text-[14.5px]">Filter by vertical; click any item for detail.</p></div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'credit', 'lending', 'investing'].map((c) => (
            <button key={c} onClick={() => setRoadFilter(c)} className={`border-[1.5px] rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${roadFilter === c ? 'border-nw-green bg-nw-mint text-nw-dark' : 'border-line text-muted'}`}>{c === 'all' ? 'All' : c === 'investing' ? 'Wealth' : c[0].toUpperCase() + c.slice(1)}</button>
          ))}
        </div>
      </div>
      {roadmap && (
        <div className="grid md:grid-cols-3 gap-4">
          {[['now', '● Now · this quarter'], ['next', '◗ Next · 1–2 quarters'], ['later', '○ Later · exploring']].map(([lane, head]) => (
            <div key={lane} className="card p-5">
              <div className="text-xs font-extrabold uppercase tracking-wide pb-3 border-b-2 border-line mb-3">{head}</div>
              {roadmap[lane].map((it: any, i: number) => {
                if (roadFilter !== 'all' && it.vertical !== roadFilter) return null;
                const key = `${lane}-${i}`; const vm = VMAP[it.vertical];
                return (
                  <div key={key} className="py-2.5 border-b border-line last:border-0 cursor-pointer" onClick={() => setOpenRoad(openRoad === key ? null : key)}>
                    <div className="font-bold text-[13.5px]">{it.title} <span className={`badge ${vm[1]} !text-[10px] !px-1.5 !py-0.5 ml-1`}>{vm[0]}</span></div>
                    <div className="text-muted text-[12.5px] mt-0.5">{it.desc}</div>
                    {openRoad === key && <div className="text-[12.5px] text-muted mt-2 pt-2 border-t border-dashed border-line">{it.detail}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
