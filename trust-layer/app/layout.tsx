import type { Metadata } from "next"
import Link from "next/link"
import AuthButton from "./components/DemoAuthButton"
import NavLinks from "./components/NavLinks"
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
            <Link href="/" className="group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-pink-300 text-sm font-black text-white shadow-sm transition-transform group-hover:scale-105 group-active:scale-95">
                TL
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-slate-950 transition-colors group-hover:text-sky-600">
                  TrustLayer
                </p>
                <p className="hidden text-xs text-slate-500 sm:block">scam protection that feels human</p>
              </div>
            </Link>

            <NavLinks />

            <div className="flex items-center gap-2">
              <select
                aria-label="Language"
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm outline-none transition hover:border-sky-200 focus:border-sky-300"
                defaultValue="en"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="zh">中文</option>
                <option value="bn">বাংলা</option>
                <option value="ht">Kreyol</option>
              </select>
              <AuthButton />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
