"use client";
import { useState } from "react";
import { useApp } from "@/app/store";
import { fetchRoute } from "@/app/lib/geocode";
import SearchPanel from "./SearchPanel";
import type { Place, TransportMode } from "@/types";

const MODES: { mode: TransportMode; label: string; icon: string; hint: string }[] = [
  { mode: "walk", label: "Walk", icon: "🚶", hint: "Optimize for walking" },
  { mode: "transit", label: "Transit", icon: "🚌", hint: "Public transport" },
  { mode: "drive", label: "Drive", icon: "🚗", hint: "Call a cab / drive" },
  { mode: "cycle", label: "Cycle", icon: "🚲", hint: "Bicycle route" },
];

export default function RoutePlanner() {
  const {
    stops,
    addStop,
    removeStop,
    reorderStops,
    clearStops,
    transportMode,
    setTransportMode,
    setActiveRoute,
    startNavigation,
    addHistory,
    activeRoute,
    setView,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleGetRoute = async () => {
    if (stops.length < 2) {
      setError("Add at least 2 stops to get directions.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const route = await fetchRoute(stops, transportMode);
   if (!route) {
        setError("Could not calculate route. Try different stops.");
        return;
      }
      setActiveRoute(route);
      addHistory({
        id: Date.now().toString(),
        query: stops.map((s) => s.name).join(" → "),
        stops,
        mode: transportMode,
        timestamp: Date.now(),
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple drag-to-reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...stops];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    reorderStops(next);
    setDragIdx(idx);
  };

  const formatDuration = (min: number) => {
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Transport mode selector */}
      <div className="flex gap-2">
        {MODES.map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => setTransportMode(mode)}
            title={label}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
              transportMode === mode
                ? "bg-primary text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Stop list */}
      <div className="flex flex-col gap-2">
        {stops.map((stop, idx) => (
          <div
            key={stop.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={() => setDragIdx(null)}
            className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-slate-100 cursor-grab"
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                idx === 0
                  ? "bg-secondary"
                  : idx === stops.length - 1
                  ? "bg-danger"
                  : "bg-accent"
              }`}
            >
              {idx === 0 ? "A" : idx === stops.length - 1 ? "Z" : String.fromCharCode(65 + idx)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{stop.name}</p>
              <p className="text-xs text-slate-400 truncate">{stop.address}</p>
            </div>
            <button
              onClick={() => removeStop(stop.id)}
              className="text-slate-300 hover:text-danger shrink-0 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}

        {/* Add stop */}
        <div className="mt-1">
          <SearchPanel
            placeholder={stops.length === 0 ? "Add starting point..." : "Add stop or destination..."}
            onSelect={(place: Place) => addStop(place)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-danger bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Route summary */}
      {activeRoute && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              {formatDuration(activeRoute.totalDurationMin)}
            </p>
            <p className="text-xs text-slate-500">
              {activeRoute.totalDistanceKm} km · {activeRoute.steps.length} steps
            </p>
          </div>
          <button
            onClick={startNavigation}
            className="bg-primary text-white text-sm font-semibold rounded-xl px-4 py-2 hover:bg-blue-700 transition"
          >
            Start
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {stops.length >= 2 && (
          <button
            onClick={handleGetRoute}
            disabled={loading}
            className="flex-1 bg-primary text-white font-semibold rounded-2xl py-3 text-sm hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Calculating..." : "Get Directions"}
          </button>
        )}
        {stops.length > 0 && (
          <button
            onClick={clearStops}
            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-medium hover:bg-slate-200 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}