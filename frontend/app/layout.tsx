import './globals.css';
import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'NerdWallet · Money Next Steps',
  description: 'Full-stack PM prototype — personalized credit, lending & investing recommendations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Nav />
        <main className="max-w-[1080px] mx-auto px-5">{children}</main>
        <footer className="border-t border-line bg-white py-5 text-center text-faint text-xs mt-8">
          Full-stack prototype · Express + SQLite backend · Next.js frontend. Products are real; rates &amp; offers current as of June 2026 — verify on issuer sites.
        </footer>
      </body>
    </html>
  );
}
