import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustLayer — Email Fraud Protection",
  description: "Automated email fraud detection for immigrants and international students. Catches scams with AI, alerts you in your language.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        {/* Global header */}
        <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TrustLayer</h1>
              <p className="text-xs text-gray-400">Automated email fraud protection</p>
            </div>
          </div>
          <nav className="flex gap-3">
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500">
              📊 Dashboard
            </a>
            <a href="/signup" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500">
              ✉️ Connect Email
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
