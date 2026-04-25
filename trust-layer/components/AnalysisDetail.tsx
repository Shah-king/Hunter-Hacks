import type { DashboardEmail } from "@/lib/types";

export function AnalysisDetail({ email }: { email: DashboardEmail }) {
  return (
    <div className="border-t border-gray-800 px-4 py-4 space-y-4">
      {/* Scores breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreCard label="Rule Score" value={email.rule_score} />
        <ScoreCard label="AI Score" value={email.ai_score} />
        <ScoreCard label="Final Score" value={email.final_score} />
      </div>

      {/* Scam type + language */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
          Type: {email.scam_type}
        </span>
        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
          Language: {email.detected_language}
        </span>
      </div>

      {/* Red flags */}
      {email.red_flags.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Red Flags</p>
          <ul className="space-y-1">
            {email.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                <span className="shrink-0 mt-0.5">⚑</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanation */}
      {email.explanation && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Explanation</p>
          <p className="text-sm text-gray-300 leading-relaxed">{email.explanation}</p>
        </div>
      )}

      {/* Actions */}
      {email.actions && email.actions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Recommended Actions</p>
          <ol className="space-y-1.5">
            {email.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase">{label}</p>
    </div>
  );
}
