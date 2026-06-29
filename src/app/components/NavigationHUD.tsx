"use client";
import { useApp } from "@/app/store";

const MANEUVER_ICON: Record<string, string> = {
  left: "↰",
  "sharp left": "↰",
  right: "↱",
  "sharp right": "↱",
  straight: "↑",
  uturn: "↩",
  arrive: "🏁",
  depart: "🚀",
};

export default function NavigationHUD() {
  const { activeRoute, currentStepIdx, nextStep, stopNavigation } = useApp();

  if (!activeRoute) return null;

  const step = activeRoute.steps[currentStepIdx];
  const isLast = currentStepIdx >= activeRoute.steps.length - 1;
  const icon = step?.maneuver
    ? MANEUVER_ICON[step.maneuver] ?? "→"
    : "→";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-white shadow-xl">
      {/* Main instruction */}
      <div className="flex items-center gap-4 px-5 pt-safe-top pt-4 pb-3">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold leading-tight truncate">
            {step?.instruction || "Continue on route"}
          </p>
          <p className="text-sm text-blue-200">
            {step?.distance} · {step?.duration}
          </p>
        </div>
        <button
          onClick={stopNavigation}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all"
          style={{
            width: `${((currentStepIdx + 1) / activeRoute.steps.length) * 100}%`,
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2 text-sm text-blue-200">
        <span>
          Step {currentStepIdx + 1} / {activeRoute.steps.length}
        </span>
        <span>
          {activeRoute.totalDurationMin} min total · {activeRoute.totalDistanceKm} km
        </span>
        <button
          onClick={isLast ? stopNavigation : nextStep}
          className="bg-white text-primary font-semibold rounded-xl px-3 py-1 text-xs"
        >
          {isLast ? "Arrive" : "Next →"}
        </button>
      </div>

      {/* Steps list */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-4 pb-3">
          {activeRoute.steps.slice(0, 8).map((s, i) => (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs ${
                i === currentStepIdx
                  ? "bg-white text-primary"
                  : "bg-white/10 text-blue-100"
              }`}
            >
              <span>{MANEUVER_ICON[s.maneuver ?? ""] ?? "→"}</span>
              <span>{s.distance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}