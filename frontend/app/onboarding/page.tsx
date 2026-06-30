'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';

type Q = { key: string; title: string; sub: string; opts: [string, string][] };
const QUESTIONS: Q[] = [
  { key: 'credit_band', title: "Where's your credit score?", sub: 'Used to estimate approval odds via a soft check — no score impact.',
    opts: [['excellent', 'Excellent (720+)'], ['good', 'Good (690–719)'], ['fair', 'Fair (630–689)'], ['building', 'Building (<630)']] },
  { key: 'goal', title: 'What matters most right now?', sub: 'Your primary goal re-ranks every recommendation.',
    opts: [['rewards', 'Earn more rewards'], ['debt', 'Pay down debt'], ['build', 'Build my credit'], ['grow', 'Grow my wealth']] },
  { key: 'cash_flow', title: 'After bills, what&apos;s left over monthly?', sub: 'Drives whether we lead with payoff or investing.',
    opts: [['tight', 'Tight — little to spare'], ['some', 'A few hundred dollars'], ['lots', '$1,000+ to put to work']] },
  { key: 'debt_type', title: 'Carrying high-interest debt?', sub: 'Card balances at 20%+ APR change the math fast.',
    opts: [['card', 'Yes — credit card balances'], ['student', 'Student / other loans'], ['none', "No, I'm debt-free"]] },
  { key: 'horizon', title: 'When do you need this money?', sub: 'Sets investment risk and product fit.',
    opts: [['short', 'Under 2 years'], ['mid', '2–7 years'], ['long', '7+ years (retirement)']] },
];

export default function Onboarding() {
  const router = useRouter();
  const { setProfileId } = useStore();
  const [ans, setAns] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const done = QUESTIONS.every((q) => ans[q.key]);

  const sample = () => setAns({ credit_band: 'good', goal: 'grow', cash_flow: 'some', debt_type: 'card', horizon: 'long' });

  async function submit() {
    setBusy(true);
    try {
      const plan = await api.createProfile({ name, ...ans } as any);
      setProfileId(plan.profile.id);
      router.push('/plan');
    } catch (e) { setBusy(false); alert('Could not reach the backend. Is it running on :4000?'); }
  }

  return (
    <div className="fade py-8">
      <div className="text-center mb-6">
        <span className="pill">ONBOARDING</span>
        <h1 className="text-[32px] font-black mt-3">Build your financial profile</h1>
        <p className="text-muted mt-1">This posts to the backend, which runs the personalization engine and persists your plan.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="flex gap-1.5 px-7 pt-5">
          {QUESTIONS.map((q) => <i key={q.key} className={`h-[5px] flex-1 rounded ${ans[q.key] ? 'bg-nw-green' : 'bg-[#e7ede9]'} transition`} />)}
        </div>
        <div className="px-7 py-4 border-b border-line">
          <h3 className="text-base font-semibold mb-0.5">Your name (optional)</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chloe"
            className="mt-2 border-[1.5px] border-line rounded-xl px-4 py-2.5 text-sm w-full max-w-xs focus:border-nw-green outline-none" />
        </div>
        {QUESTIONS.map((q) => (
          <div key={q.key} className="px-7 py-5 border-b border-line last:border-0">
            <h3 className="text-[16.5px] font-semibold mb-0.5" dangerouslySetInnerHTML={{ __html: q.title }} />
            <p className="text-[13px] text-muted mb-3.5">{q.sub}</p>
            <div className="flex flex-wrap gap-2.5">
              {q.opts.map(([val, label]) => (
                <button key={val} onClick={() => setAns((a) => ({ ...a, [q.key]: val }))}
                  className={`border-[1.5px] rounded-xl px-4 py-2.5 text-sm font-medium transition ${ans[q.key] === val ? 'border-nw-green bg-nw-mint text-nw-dark font-semibold' : 'border-line hover:border-[#a9c2b6]'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <button className="cta" disabled={!done || busy} onClick={submit}>{busy ? 'Building your plan…' : 'See my money next steps →'}</button>
        <div className="mt-3.5"><button onClick={sample} className="text-muted text-sm underline">Skip — use a sample profile</button></div>
      </div>
    </div>
  );
}
