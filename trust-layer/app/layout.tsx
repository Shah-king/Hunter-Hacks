import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustLayer — Email Fraud Protection",
  description: "Automated email fraud detection for immigrants and international students. Catches scams with AI, alerts you in your language.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                TL
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">TrustLayer</h1>
                <p className="hidden text-xs text-slate-500 sm:block">Automated email fraud protection</p>
              </div>
            </Link>
            <nav className="flex shrink-0 gap-2">
              <Link href="/" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white sm:text-sm">
                Dashboard
              </Link>
              <Link href="/signup" className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 sm:text-sm">
                Connect Email
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
