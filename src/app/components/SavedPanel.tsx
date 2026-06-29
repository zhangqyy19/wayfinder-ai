"use client";
import { useApp } from "@/app/store";

export default function SavedPanel() {
  const {
    savedPlaces,
    removeFromSaved,
    history,
    clearHistory,
    addStop,
    setView,
  } = useApp();

  const handleRestoreHistory = (idx: number) => {
    const entry = history[idx];
    entry.stops.forEach((s) => addStop(s));
    setView("route");
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      {/* Saved places */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Saved Places
        </h2>
        {savedPlaces.length === 0 ? (
          <p className="text-sm text-slate-400 italic px-1">No saved places yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {savedPlaces.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100"
              >
                <span className="text-xl shrink-0">
                  {p.label === "Home"
                    ? "🏠"
                    : p.label === "Work"
                    ? "💼"
                    : "⭐"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{p.label ?? p.name}</p>
                  <p className="text-xs text-slate-400 truncate">{p.address}</p>
                </div>
                <button
                  onClick={() => {
                    addStop(p);
                    setView("route");
                  }}
                  className="text-xs text-primary font-semibold hover:underline shrink-0"
                >
                  Go
                </button>
         <button
                  onClick={() => removeFromSaved(p.id)}
                  className="text-slate-300 hover:text-danger text-lg leading-none shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Recent Trips
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-slate-400 hover:text-danger"
            >
              Clear all
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 italic px-1">No trip history yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.slice(0, 10).map((entry, idx) => (
              <button
                key={entry.id}
                onClick={() => handleRestoreHistory(idx)}
                className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 text-left hover:bg-slate-50 transition"
              >
                <span className="text-xl shrink-0 mt-0.5">🕐</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{entry.query}</p>
           <p className="text-xs text-slate-400">
                    {new Date(entry.timestamp).toLocaleDateString()} ·{" "}
                    {entry.mode}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}