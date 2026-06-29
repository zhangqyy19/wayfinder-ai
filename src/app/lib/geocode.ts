import type { SearchResult, LatLng, Route, TransportMode, Place } from "@/types";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OSRM_BASE = "https://router.project-osrm.org/route/v1";

// ─── Geocoding ────────────────────────────────────────────────────────
export async function searchPlaces(
  query: string,
  near?: LatLng
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "8",
    addressdetails: "1",
    ...(near ? { lat: String(near.lat), lon: String(near.lng) } : {}),
  });
  const res = await fetch(`${NOMINATIM}/search?${params}`, {
    headers: { "Accept-Language": "en" },
  });
  const data = await res.json();
  return data.map((item: Record<string, unknown>) => ({
    id: String(item.place_id),
    name: String(item.name || (item.address as Record<string,string>)?.road || item.display_name),
    address: String(item.display_name),
    coords: { lat: Number(item.lat), lng: Number(item.lon) },
    category: String(item.type || item.class || ""),
  }));
}

export async function reverseGeocode(coords: LatLng): Promise<string> {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lng),
    format: "json",
  });
  const res = await fetch(`${NOMINATIM}/reverse?${params}`, {
    headers: { "Accept-Language": "en" },
  });
  const data = await res.json();
  return String(data.display_name ?? "Unknown location");
}

// ─── OSRM Routing ─────────────────────────────────────────────────────
const OSRM_PROFILE: Record<TransportMode, string> = {
  walk: "foot",
  transit: "driving", // OSRM doesn't have transit; proxy with driving
  drive: "driving",
  cycle: "cycling",
};

export async function fetchRoute(
  stops: Place[],
  mode: TransportMode
): Promise<Route | null> {
  if (stops.length < 2) return null;
  const profile = OSRM_PROFILE[mode];
  const coords = stops.map((s) => `${s.coords.lng},${s.coords.lat}`).join(";");
  const url = `${OSRM_BASE}/${profile}/${coords}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok") return null;

  const leg0 = data.routes[0];
  const polyline: LatLng[] = leg0.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => ({ lat, lng })
  );

  const steps = leg0.legs.flatMap((leg: Record<string, unknown>) =>
    (leg.steps as Record<string, unknown>[]).map((step: Record<string, unknown>) => ({
      instruction: (step.maneuver as Record<string,string>)?.type ?? "",
      distance: `${((step.distance as number) / 1000).toFixed(2)} km`,
      duration: `${Math.ceil((step.duration as number) / 60)} min`,
      maneuver: (step.maneuver as Record<string,string>)?.modifier ?? "",
      coords: {
        lat: ((step.maneuver as Record<string, Record<string,number>>)?.location)?.[1] ?? stops[0].coords.lat,
        lng: ((step.maneuver as Record<string, Record<string,number>>)?.location)?.[0] ?? stops[0].coords.lng,
      },
    }))
  );

  return {
    id: Date.now().toString(),
    stops,
    mode,
    totalDurationMin: Math.ceil(leg0.duration / 60),
    totalDistanceKm: Math.round((leg0.distance / 1000) * 10) / 10,
    polyline,
    steps,
  };
}