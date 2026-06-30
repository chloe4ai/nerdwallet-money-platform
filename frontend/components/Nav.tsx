'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/plan', label: 'My Plan' },
  { href: '/market', label: 'Market Intel' },
  { href: '/metrics', label: 'Metrics & Roadmap' },
];

export function Nav() {
  const path = usePathname();
  const { pmLens, togglePmLens } = useStore();
  return (
    <header className="bg-white border-b border-line sticky top-0 z-30">
      <div className="max-w-[1080px] mx-auto px-5 h-16 flex items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-[21px] text-nw-dark tracking-tight">
          <svg width="26" height="26" viewBox="0 0 100 100" aria-hidden>
            <polygon points="10,90 10,30 40,60 40,90" fill="#006842" />
            <polygon points="10,30 10,10 60,60 40,60" fill="#00ae4d" />
            <polygon points="60,60 60,10 90,10 90,40" fill="#8ccb32" />
            <polygon points="90,40 90,90 60,60" fill="#00ae4d" />
          </svg>
          nerdwallet
        </Link>
        <nav className="flex gap-1 bg-[#eef3f0] p-1 rounded-xl">
          {LINKS.map((l) => {
            const on = l.href === '/' ? path === '/' : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className={`text-[13.5px] font-semibold px-3.5 py-2 rounded-lg transition ${on ? 'bg-white text-nw-dark shadow-sm' : 'text-muted hover:text-ink'}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={togglePmLens} className="flex items-center gap-2 text-[12.5px] text-muted font-semibold">
          <span>PM lens</span>
          <span className={`w-[38px] h-[22px] rounded-full relative transition ${pmLens ? 'bg-nw-green' : 'bg-[#cfdad4]'}`}>
            <span className={`absolute w-[18px] h-[18px] rounded-full bg-white top-0.5 transition-all shadow ${pmLens ? 'left-[18px]' : 'left-0.5'}`} />
          </span>
        </button>
      </div>
    </header>
  );
}
