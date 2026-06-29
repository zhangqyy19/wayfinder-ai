"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { AppContext, useAppStore } from "@/app/store";
import { reverseGeocode } from "@/app/lib/geocode";
import BottomNav from "@/app/components/BottomNav";
import NavigationHUD from "@/app/components/NavigationHUD";
import RoutePlanner from "@/app/components/RoutePlanner";
import SearchPanel from "@/app/components/SearchPanel";
import SavedPanel from "@/app/components/SavedPanel";
import LayerControls from "@/app/components/LayerControls";

// MapView must be client-only (Leaflet requires window)
const MapView = dynamic(() => import("@/app/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-slate-400 text-sm animate-pulse">Loading map…</div>
    </div>
  ),
});

export default function WayfinderApp() {
  const store = useAppStore();
  const { view, setUserLocation, isNavigating, setView } = store;
  const didLocate = useRef(false);

  // Request geolocation on mount
  useEffect(() => {
    if (didLocate.current) return;
    didLocate.current = true;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
      },
      () => {
        // Permission denied – stay at default center
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [setUserLocation]);

  const showSheet = !isNavigating && view !== "home";

  return (
    <AppContext.Provider value={store}>
      {/* Full-screen map background */}
      <div className="fixed inset-0">
        <MapView />
      </div>

      {/* Navigation HUD (overlays map when navigating) */}
      {isNavigating && <NavigationHUD />}

      {/* Top bar */}
      {!isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-30 px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {/* App logo */}
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
              W
            </div>
            {/* Search bar */}
            <div className="flex-1">
              <SearchPanel placeholder="Where to?" />
            </div>
            {/* My location button */}
            <button
              onClick={() => {
                if (store.userLocation) {
                  store.setMapCenter(store.userLocation);
                  store.setMapZoom(16);
                }
              }}
              className="w-10 h-10 bg-white rounded-2xl shadow-md flex items-center justify-center text-xl shrink-0 hover:bg-slate-50"
              title="My location"
            >
              📍
            </button>
          </div>
        </div>
      )}

      {/* Bottom drawer / sheet */}
      {showSheet && (
        <div className="fixed bottom-16 left-0 right-0 z-30 max-h-[60vh] overflow-y-auto no-scrollbar bg-surface rounded-t-3xl shadow-2xl border-t border-slate-100">
          <div className="drag-handle" />

          {view === "route" && <RoutePlanner />}
          {view === "saved" && <SavedPanel />}
          {view === "settings" && (
            <div className="p-4">
              <LayerControls />
            </div>
          )}
        </div>
      )}

      {/* Floating action buttons (map view) */}
      {view === "home" && !isNavigating && (
        <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-30">
          {/* Directions shortcut */}
          <button
            onClick={() => setView("route")}
            className="w-12 h-12 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center text-xl hover:bg-blue-700 transition"
            title="Directions"
          >
            🧭
          </button>
          {/* Restroom shortcut */}
          <button
            onClick={() => setView("settings")}
            className="w-12 h-12 bg-white text-slate-700 rounded-2xl shadow-lg flex items-center justify-center text-xl hover:bg-slate-50 transition border border-slate-100"
            title="Layers"
          >
            📡
          </button>
        </div>
      )}

      {/* Bottom navigation */}
      <BottomNav />

      {/* Attribution */}
      <div className="fixed bottom-16 left-3 z-20 text-[10px] text-slate-400 pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </AppContext.Provider>
  );
}