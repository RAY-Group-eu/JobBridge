import type { ErrorInfo } from "@/lib/types/jobbridge";

export function QueryDebugPanel({
  title,
  summary,
  debug,
  error,
}: {
  title: string;
  summary: Record<string, unknown>;
  debug: Record<string, unknown>;
  error?: ErrorInfo | null;
}) {
  if (process.env.NEXT_PUBLIC_SHOW_DEBUG_QUERY_PANEL !== "true") return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-[11px] font-mono text-slate-200 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-400">{title}</div>
          <div className="mt-1 text-slate-300">
            {Object.entries(summary).map(([k, v]) => (
              <span key={k} className="mr-3 inline-block">
                <span className="text-slate-500">{k}:</span> {String(v)}
              </span>
            ))}
          </div>
        </div>
        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300">
            <div className="text-[10px] uppercase tracking-wider text-red-200/80">Query Error</div>
            <div className="mt-1">{error.code ? `${error.code}: ` : ""}{error.message}</div>
          </div>
        ) : null}
      </div>

      <details className="mt-3 text-slate-300">
        <summary className="cursor-pointer select-none text-slate-500 hover:text-slate-300">
          Details (raw debug)
        </summary>
        <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-white/5 bg-black/30 p-3 text-[10px] text-slate-300">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </details>
    </div>
  );
}

