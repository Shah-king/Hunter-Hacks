// StatsBar — Top-level counters for the dashboard
interface StatsBarProps {
  total: number;
  scam: number;
  suspicious: number;
  safe: number;
  alertsSent: number;
}

export function StatsBar({ total, scam, suspicious, safe, alertsSent }: StatsBarProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      <StatCard label="Processed" value={total} color="text-white" />
      <StatCard label="Scam" value={scam} color="text-red-400" />
      <StatCard label="Suspicious" value={suspicious} color="text-yellow-400" />
      <StatCard label="Safe" value={safe} color="text-green-400" />
      <StatCard label="Alerts Sent" value={alertsSent} color="text-blue-400" />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
