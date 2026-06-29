"use client";
import { useApp } from "@/app/store";
import type { AppView } from "@/types";

const TABS: { view: AppView; label: string; icon: string }[] = [
  { view: "home", label: "Map", icon: "🗺️" },
  { view: "route", label: "Directions", icon: "🧭" },
  { view: "saved", label: "Saved", icon: "⭐" },
  { view: "settings", label: "Layers", icon: "📡" },
];

export default function BottomNav() {
  const { view, setView, isNavigating } = useApp();
  if (isNavigating) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 safe-area-pb">
      <div className="flex">
        {TABS.map(({ view: v, label, icon }) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              view === v
                ? "text-primary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            {label}
            {view === v && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}