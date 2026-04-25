const RISK_STYLES = {
  scam: { bg: "bg-red-600", text: "text-white", pulse: "animate-pulse" },
  suspicious: { bg: "bg-yellow-500", text: "text-black", pulse: "" },
  safe: { bg: "bg-green-600", text: "text-white", pulse: "" },
};

export function RiskBadge({ level, score }: { level: "scam" | "suspicious" | "safe"; score: number }) {
  const style = RISK_STYLES[level];

  return (
    <div className={`${style.bg} ${style.text} ${style.pulse} px-3 py-1.5 rounded-lg text-center min-w-[72px]`}>
      <p className="text-xs font-bold uppercase">{level}</p>
      <p className="text-[10px] opacity-80">{score}%</p>
    </div>
  );
}
