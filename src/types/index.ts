// ─── Coordinates ────────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

// ─── Places / Stops ─────────────────────────────────────────────────
export interface Place {
  id: string;
  name: string;
  address: string;
  coords: LatLng;
  type?: PlaceType;
}

export type PlaceType =
  | "origin"
  | "destination"
  | "waypoint"
  | "restroom"
  | "wifi"
  | "saved";

// ─── Transport Mode ──────────────────────────────────────────────────
export type TransportMode = "walk" | "transit" | "drive" | "cycle";

export interface TransportOption {
  mode: TransportMode;
  label: string;
  icon: string;
  durationMin: number;
  distanceKm: number;
  cost?: string; // e.g. "$12 estimated"
}

// ─── Route ──────────────────────────────────────────────────────────
export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver?: string; // turn-left, turn-right, etc.
  coords: LatLng;
}

export interface Route {
  id: string;
  stops: Place[];
  mode: TransportMode;
  totalDurationMin: number;
  totalDistanceKm: number;
  polyline: LatLng[];
  steps: RouteStep[];
  cost?: string;
}

// ─── Nearby POI ──────────────────────────────────────────────────────
export interface RestroomPOI {
  id: string;
  name: string;
  coords: LatLng;
  address: string;
  accessible: boolean;
  rating?: number;
  openNow?: boolean;
}

export interface WifiPOI {
  id: string;
  name: string;
  coords: LatLng;
  address: string;
  type: "free" | "free_with_purchase";
  provider?: string; // e.g. "Starbucks", "McDonald's"
  rating?: number;
}

// ─── Search ─────────────────────────────────────────────────────────
export interface SearchResult {
  id: string;
  name: string;
  address: string;
  coords: LatLng;
  category?: string;
  distance?: string; // relative to current location
}

// ─── Saved / History ────────────────────────────────────────────────
export interface SavedPlace extends Place {
  savedAt: number; // timestamp
  label?: string; // "Home", "Work", etc.
}

export interface HistoryEntry {
  id: string;
  query: string;
  stops: Place[];
  mode: TransportMode;
  timestamp: number;
}

// ─── App State ───────────────────────────────────────────────────────
export type AppView =
  | "home"
  | "search"
  | "route"
  | "navigation"
  | "saved"
  | "settings";

export type OverlayLayer = "restroom" | "wifi" | "none";