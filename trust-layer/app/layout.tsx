import type { Metadata } from "next"
import Link from "next/link"
import DemoAuthButton from "./components/DemoAuthButton"
import LanguageSelect from "./components/LanguageSelect"
import "./globals.css"

export const metadata: Metadata = {
  title: "TrustLayer — Friendly Scam Protection",
  description:
    "A calm, community-powered scam protection app for immigrants, students, and families.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased" suppressHydrationWarning>
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-pink-300 text-sm font-black text-white shadow-sm">
                TL
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-slate-950">TrustLayer</p>
                <p className="hidden text-xs text-slate-500 sm:block">scam protection that feels human</p>
              </div>
            </Link>

            <nav className="hidden items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-600 shadow-sm md:flex">
              <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-white hover:text-slate-950 hover:shadow-sm">
                Dashboard
              </Link>
              <Link href="/#analyze" className="rounded-full px-4 py-2 transition hover:bg-white hover:text-slate-950 hover:shadow-sm">
                Analyze
              </Link>
              <Link href="/social" className="rounded-full px-4 py-2 transition hover:bg-white hover:text-slate-950 hover:shadow-sm">
                Social
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <LanguageSelect />
              <DemoAuthButton />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
