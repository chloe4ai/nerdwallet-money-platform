'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SC: Record<string, [string, string, string]> = {
  strong: ['●', 'Strong', 'text-nw-green'], med: ['◐', 'Medium', 'text-amber'],
  weak: ['○', 'Limited', 'text-faint'], none: ['○', 'None', 'text-faint'],
};
const impCls = (x: string) => (x === 'High' ? 'b-green' : x === 'Med' ? 'b-amber' : 'b-blue');

export default function MarketPage() {
  const [verticals, setVerticals] = useState<{ vertical: string; label: string }[]>([]);
  const [cur, setCur] = useState('credit');
  const [data, setData] = useState<any>(null);
  const [sel, setSel] = useState<any>(null);
  const [openOpp, setOpenOpp] = useState<number | null>(null);

  useEffect(() => { api.getVerticals().then(setVerticals).catch(() => {}); }, []);
  useEffect(() => { setSel(null); setOpenOpp(null); api.getMarket(cur).then(setData).catch(() => {}); }, [cur]);

  if (!data) return <div className="py-20 text-center text-muted">Loading market data…</div>;
  const codes: string[] = data.competitors.map((c: any) => c.code);

  return (
    <div className="fade py-7">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-3">
        <div><h2 className="text-[25px] font-bold">Competitive landscape</h2>
          <p className="text-muted text-[14.5px] max-w-[560px]">Pick a vertical — the positioning map, feature grid, and white-space bets all update. Click any competitor to see our angle.</p></div>
        <span className="pill">MARKET ANALYSIS</span>
      </div>

      <div className="flex gap-2 mb-3.5 flex-wrap">
        {verticals.map((v) => (
          <button key={v.vertical} onClick={() => setCur(v.vertical)}
            className={`border-[1.5px] rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition ${cur === v.vertical ? 'border-nw-green bg-nw-mint text-nw-dark' : 'border-line text-muted hover:border-[#a9c2b6]'}`}>
            {v.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-[#3a4a43] bg-white border border-line border-l-[3px] border-l-nw-green rounded-r-xl px-4 py-3 mb-3.5">{data.summary}</p>

      <div className="matrix">
        <div className="axis ax-x" /><div className="axis ax-y" />
        <div className="axlbl" style={{ left: '8%', top: '48%', transform: 'translateY(-130%)' }}>← {data.axis.l}</div>
        <div className="axlbl" style={{ right: '5%', top: '48%', transform: 'translateY(-130%)', textAlign: 'right' }}>{data.axis.r} →</div>
        <div className="axlbl" style={{ left: '51%', top: '4%' }}>{data.axis.t} ↑</div>
        <div className="axlbl" style={{ left: '51%', bottom: '7%' }}>↓ {data.axis.b}</div>
        {data.competitors.map((c: any) => (
          <div key={c.code} className={`blob ${sel?.code === c.code ? 'sel' : ''}`} style={{ left: `${c.x}%`, top: `${100 - c.y}%` }} onClick={() => setSel(c)}>
            <div className="b-dot" style={{ width: c.size, height: c.size, background: c.color }}>{c.code}</div>
            <div className="b-name">{c.name}</div>
          </div>
        ))}
      </div>

      {sel && (
        <div className="card p-5 mt-3.5 fade">
          <div className="flex items-center gap-3">
            <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-extrabold text-xs" style={{ background: sel.color }}>{sel.code}</div>
            <h3 className="text-[19px] font-bold">{sel.name}{sel.is_us ? " · that's us" : ''}</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-3 text-[13px] leading-relaxed">
            <div><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-nw-dark mb-1">Strength</div>{sel.strength}</div>
            <div><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-rednw mb-1">Weakness</div>{sel.weakness}</div>
            <div><div className="text-[10.5px] font-extrabold uppercase tracking-wide text-bluenw mb-1">{sel.is_us ? 'Our focus' : "NerdWallet's angle"}</div>{sel.angle}</div>
          </div>
        </div>
      )}

      <div className="mt-8 mb-3"><h2 className="text-[25px] font-bold">Feature coverage</h2><p className="text-muted text-[14.5px]">Depth across {data.label.toLowerCase()} — the NerdWallet column is highlighted.</p></div>
      <div className="card overflow-hidden">
        <table className="w-full border-collapse">
          <thead><tr>
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted bg-[#f3f7f5]">Capability</th>
            {data.competitors.map((c: any) => <th key={c.code} className={`text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted ${c.is_us ? 'bg-nw-mint' : 'bg-[#f3f7f5]'}`}>{c.name}</th>)}
          </tr></thead>
          <tbody>
            {data.features.map((f: any, i: number) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-3 text-[13.5px] font-bold">{f.capability}</td>
                {codes.map((code) => { const s = SC[f.scores[code]] || SC.none; const us = data.competitors.find((c: any) => c.code === code)?.is_us;
                  return <td key={code} className={`px-4 py-3 text-[13.5px] ${us ? 'bg-nw-mint' : ''}`}><span className={`${s[2]} font-extrabold`}>{s[0]}</span> {s[1]}</td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 mb-3"><h2 className="text-[25px] font-bold">Where NerdWallet can win</h2><p className="text-muted text-[14.5px]">The white-space bets that fall out of this vertical — click to expand.</p></div>
      <div className="grid sm:grid-cols-3 gap-4">
        {data.opportunities.map((o: any) => (
          <div key={o.num} className="card p-5 cursor-pointer" onClick={() => setOpenOpp(openOpp === o.num ? null : o.num)}>
            <div className="flex items-center gap-2.5 font-extrabold text-[15px] mb-1.5"><span className="w-[26px] h-[26px] rounded-lg bg-nw-green text-white grid place-items-center text-[13px]">{o.num}</span>{o.title}</div>
            <p className="text-[13px] text-muted">{o.body}</p>
            <span className={`badge ${impCls(o.impact)} mt-2.5 inline-block`}>{o.impact} impact · {o.effort} effort</span>
            {openOpp === o.num && <div className="text-[12.5px] text-muted mt-2.5 pt-2.5 border-t border-dashed border-line">{o.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
