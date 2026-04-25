import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-3xl items-center justify-center px-4 py-10 text-center">
      <section className="soft-card rounded-[34px] p-8 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-500">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
          Demo mode is on
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
          TrustLayer is running with mock data for the hackathon demo, so there is no account setup or Supabase auth required.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5">
            Go to dashboard
          </Link>
          <Link href="/social" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5">
            View TrustWall
          </Link>
        </div>
      </section>
    </main>
  )
}
