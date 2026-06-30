'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { api, Plan } from '@/lib/api';

export default function Home() {
  const { profileId } = useStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    if (!profileId) return;
    api.getPlan(profileId).then(setPlan).catch(() => {});
    api.getActions(profileId).then(setActions).catch(() => {});
  }, [profileId]);

  return (
    <div className="fade">
      <section className="text-center pt-14 pb-7">
        <span className="pill">PERSONALIZED · DATA-DRIVEN · FULL-STACK</span>
        <h1 className="text-[42px] leading-[1.08] font-black mt-4 mb-3.5">
          What&apos;s your smartest<br />
          <span className="bg-gradient-to-r from-nw-green to-nw-dark bg-clip-text text-transparent">money move</span> right now?
        </h1>
        <p className="text-[17px] text-muted max-w-[580px] mx-auto">
          Answer 5 questions. Our backend reads your financial profile and ranks your best next step
          across credit cards, loans, and investing — sequenced, persisted, and measurable.
        </p>
        <div className="mt-7 flex gap-3 justify-center">
          <Link href="/onboarding" className="cta">{plan ? 'Redo my profile' : 'Build my plan'} →</Link>
          {plan && <Link href="/plan" className="cta !bg-white !text-nw-dark border-[1.5px] border-nw-green hover:!bg-nw-mint">View my plan</Link>}
        </div>
      </section>

      {plan && (
        <section className="card p-6 my-4 fade">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="score-ring" style={{ ['--p' as any]: Math.round(((plan.profile.moneyHealth - 500) / 320) * 100) }}>
              <div className="inner"><div><div className="text-[30px] font-black leading-none">{plan.profile.moneyHealth}</div><div className="text-[10px] text-muted font-semibold">MONEY HEALTH</div></div></div>
            </div>
            <div className="flex-1 min-w-[240px]">
              <h2 className="text-[22px] font-bold mb-1">Welcome back{plan.profile.name ? `, ${plan.profile.name}` : ''}.</h2>
              <p className="text-muted text-sm mb-2">Your plan is saved. Here&apos;s what you&apos;ve acted on so far.</p>
              <div className="flex gap-2 flex-wrap">{plan.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          </div>
          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            {['credit', 'lending', 'investing'].map((v) => {
              const a = actions.find((x) => x.vertical === v);
              const label = { credit: 'Consumer Credit', lending: 'Financial Services', investing: 'Investment Products' }[v];
              return (
                <div key={v} className="border border-line rounded-xl p-3.5">
                  <div className="text-[10.5px] font-extrabold uppercase tracking-wide text-faint">{label}</div>
                  {a ? <><div className="font-bold text-sm mt-1">{a.name}</div><span className={`badge mt-1.5 inline-block ${a.status === 'applied' ? 'b-green' : 'b-blue'}`}>{a.status}</span></>
                     : <div className="text-sm text-faint mt-1">Not acted on yet</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid sm:grid-cols-3 gap-4 my-6">
        {[
          { t: 'Personalized engine', d: 'A server-side model scores your profile and ranks one real product per vertical — with a "why this matches you".', i: '🎯' },
          { t: 'Market intelligence', d: 'A relational competitive database: positioning maps, feature coverage, and white-space bets per vertical.', i: '📊' },
          { t: 'Live in the numbers', d: 'A real event stream aggregated into a funnel, KPIs, an A/B board, and a what-if revenue simulator.', i: '📈' },
        ].map((c) => (
          <div key={c.t} className="card p-5">
            <div className="text-2xl">{c.i}</div>
            <div className="font-bold text-[17px] mt-2">{c.t}</div>
            <p className="text-sm text-muted mt-1">{c.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
