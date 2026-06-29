"use client";
import { useApp } from "@/app/store";
import { fetchRestrooms, fetchWifiSpots } from "@/app/lib/overpass";
import type { OverlayLayer } from "@/types";

export default function LayerControls() {
  const {
    overlayLayer,
    setOverlayLayer,
    mapCenter,
    setRestrooms,
    setWifiSpots,
  } = useApp();

  const toggle = async (layer: OverlayLayer) => {
    if (overlayLayer === layer) {
      setOverlayLayer("none");
      return;
    }
    setOverlayLayer(layer);
    if (layer === "restroom") {
      try {
        const pois = await fetchRestrooms(mapCenter, 1500);
        setRestrooms(pois);
      } catch {
        console.warn("Restroom fetch failed");
      }
    }
    if (layer === "wifi") {
      try {
        const pois = await fetchWifiSpots(mapCenter, 1500);
        setWifiSpots(pois);
      } catch {
        console.warn("WiFi fetch failed");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
        Map Layers
      </p>
      <button
        onClick={() => toggle("restroom")}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          overlayLayer === "restroom"
            ? "bg-violet-100 text-violet-700 border border-violet-200"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100"
        }`}
      >
        <span className="text-xl">🚻</span>
        <div className="text-left">
          <p>Restrooms</p>
          <p className="text-xs text-slate-400 font-normal">Nearby public toilets</p>
        </div>
        {overlayLayer === "restroom" && (
          <span className="ml-auto text-violet-500 font-bold">✓</span>
        )}
      </button>

      <button
        onClick={() => toggle("wifi")}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          overlayLayer === "wifi"
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100"
        }`}
      >
        <span className="text-xl">📶</span>
        <div className="text-left">
          <p>Free WiFi</p>
          <p className="text-xs text-slate-400 font-normal">Free & free-with-purchase hotspots</p>
        </div>
        {overlayLayer === "wifi" && (
          <span className="ml-auto text-emerald-500 font-bold">✓</span>
        )}
      </button>
    </div>
  );
}