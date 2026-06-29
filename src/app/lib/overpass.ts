import type { LatLng, RestroomPOI, WifiPOI } from "@/types";

const OVERPASS = "https://overpass-api.de/api/interpreter";

async function runQuery(query: string) {
  const res = await fetch(OVERPASS, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.json();
}

// ─── Restrooms ────────────────────────────────────────────────────────
export async function fetchRestrooms(
  center: LatLng,
  radiusM = 1000
): Promise<RestroomPOI[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="toilets"](around:${radiusM},${center.lat},${center.lng});
      way["amenity"="toilets"](around:${radiusM},${center.lat},${center.lng});
    );
    out center 30;
  `;
  const data = await runQuery(query);
  return (data.elements ?? []).map((el: Record<string, unknown>) => {
    const tags = (el.tags ?? {}) as Record<string, string>;
    const lat = Number(el.lat ?? (el as Record<string, Record<string,number>>).center?.lat);
    const lng = Number(el.lon ?? (el as Record<string, Record<string,number>>).center?.lon);
    return {
      id: String(el.id),
      name: tags.name || tags["name:en"] || "Public Restroom",
      coords: { lat, lng },
      address: tags["addr:street"]
        ? `${tags["addr:housenumber"] ?? ""} ${tags["addr:street"]}`.trim()
        : `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      accessible: tags.wheelchair === "yes" || tags.wheelchair === "designated",
      openNow: tags.opening_hours
        ? undefined // Could integrate opening_hours.js
        : undefined,
    } as RestroomPOI;
  });
}

// ─── Free WiFi ────────────────────────────────────────────────────────
export async function fetchWifiSpots(
  center: LatLng,
  radiusM = 1000
): Promise<WifiPOI[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["internet_access"="wlan"](around:${radiusM},${center.lat},${center.lng});
      node["internet_access"="free"](around:${radiusM},${center.lat},${center.lng});
      way["internet_access"="wlan"](around:${radiusM},${center.lat},${center.lng});
    );
    out center 30;
  `;
  const data = await runQuery(query);
  return (data.elements ?? []).map((el: Record<string, unknown>) => {
    const tags = (el.tags ?? {}) as Record<string, string>;
    const lat = Number(el.lat ?? (el as Record<string, Record<string,number>>).center?.lat);
    const lng = Number(el.lon ?? (el as Record<string, Record<string,number>>).center?.lon);
    const isFree =
      tags["internet_access:fee"] === "no" ||
      tags.internet_access === "free";
    return {
      id: String(el.id),
      name: tags.name || tags["name:en"] || tags.operator || "WiFi Hotspot",
      coords: { lat, lng },
      address: tags["addr:street"]
        ? `${tags["addr:housenumber"] ?? ""} ${tags["addr:street"]}`.trim()
        : `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      type: isFree ? "free" : "free_with_purchase",
      provider: tags.operator ?? tags.brand,
    } as WifiPOI;
  });
}