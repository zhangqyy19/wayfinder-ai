"use client";
import { useState, useCallback, createContext, useContext } from "react";
import type {
  Place,
  Route,
  TransportMode,
  OverlayLayer,
  AppView,
  SavedPlace,
  HistoryEntry,
  RestroomPOI,
  WifiPOI,
  LatLng,
} from "@/types";

// ─── State Shape ────────────────────────────────────────────────────
export interface AppState {
  userLocation: LatLng | null;
  stops: Place[];
  activeRoute: Route | null;
  transportMode: TransportMode;
  overlayLayer: OverlayLayer;
  view: AppView;
  isNavigating: boolean;
  currentStepIdx: number;
  savedPlaces: SavedPlace[];
  history: HistoryEntry[];
  restrooms: RestroomPOI[];
  wifiSpots: WifiPOI[];
  searchQuery: string;
  mapCenter: LatLng;
  mapZoom: number;
}

// ─── Actions ────────────────────────────────────────────────────────
export interface AppActions {
  setUserLocation: (loc: LatLng) => void;
  addStop: (place: Place) => void;
  removeStop: (id: string) => void;
  reorderStops: (stops: Place[]) => void;
  clearStops: () => void;
  setActiveRoute: (route: Route | null) => void;
  setTransportMode: (mode: TransportMode) => void;
  setOverlayLayer: (layer: OverlayLayer) => void;
  setView: (view: AppView) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  nextStep: () => void;
  savePlace: (place: SavedPlace) => void;
  removeFromSaved: (id: string) => void;
  addHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  setRestrooms: (pois: RestroomPOI[]) => void;
  setWifiSpots: (pois: WifiPOI[]) => void;
  setSearchQuery: (q: string) => void;
  setMapCenter: (center: LatLng) => void;
  setMapZoom: (zoom: number) => void;
}

const DEFAULT_CENTER: LatLng = { lat: 40.7128, lng: -74.006 }; // New York

export const defaultState: AppState = {
  userLocation: null,
  stops: [],
  activeRoute: null,
  transportMode: "walk",
  overlayLayer: "none",
  view: "home",
  isNavigating: false,
  currentStepIdx: 0,
  savedPlaces: [],
  history: [],
  restrooms: [],
  wifiSpots: [],
  searchQuery: "",
  mapCenter: DEFAULT_CENTER,
  mapZoom: 13,
};

// ─── Context ─────────────────────────────────────────────────────────
export const AppContext = createContext<AppState & AppActions>(
  {} as AppState & AppActions
);

export function useAppStore() {
  const [state, setState] = useState<AppState>(defaultState);

  const update = useCallback(
    (partial: Partial<AppState>) =>
      setState((prev) => ({ ...prev, ...partial })),
    []
  );

  const actions: AppActions = {
    setUserLocation: (loc) => update({ userLocation: loc, mapCenter: loc }),
    addStop: (place) =>
      update({ stops: [...state.stops, place] }),
    removeStop: (id) =>
      update({ stops: state.stops.filter((s) => s.id !== id) }),
    reorderStops: (stops) => update({ stops }),
    clearStops: () => update({ stops: [], activeRoute: null }),
    setActiveRoute: (route) => update({ activeRoute: route }),
    setTransportMode: (mode) => update({ transportMode: mode }),
    setOverlayLayer: (layer) => update({ overlayLayer: layer }),
    setView: (view) => update({ view }),
    startNavigation: () =>
      update({ isNavigating: true, currentStepIdx: 0, view: "navigation" }),
    stopNavigation: () =>
      update({ isNavigating: false, currentStepIdx: 0, view: "route" }),
    nextStep: () =>
      update({ currentStepIdx: state.currentStepIdx + 1 }),
    savePlace: (place) =>
      update({ savedPlaces: [place, ...state.savedPlaces] }),
    removeFromSaved: (id) =>
      update({ savedPlaces: state.savedPlaces.filter((p) => p.id !== id) }),
    addHistory: (entry) =>
      update({ history: [entry, ...state.history].slice(0, 50) }),
    clearHistory: () => update({ history: [] }),
    setRestrooms: (pois) => update({ restrooms: pois }),
    setWifiSpots: (pois) => update({ wifiSpots: pois }),
    setSearchQuery: (q) => update({ searchQuery: q }),
    setMapCenter: (center) => update({ mapCenter: center }),
    setMapZoom: (zoom) => update({ mapZoom: zoom }),
  };

  return { ...state, ...actions };
}

export function useApp() {
  return useContext(AppContext);
}