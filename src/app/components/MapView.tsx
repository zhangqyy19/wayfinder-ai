"use client";
import { useEffect, useRef } from "react";
import { useApp } from "@/app/store";
import type { LatLng, RestroomPOI, WifiPOI } from "@/types";

// Dynamically imported to avoid SSR issues with Leaflet
let L: typeof import("leaflet");

const TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function createIcon(color: string, emoji: string, size = 36) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.45}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function MapView() {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const routeLayerRef = useRef<import("leaflet").Polyline | null>(null);

  const {
    mapCenter,
    mapZoom,
    userLocation,
    stops,
    activeRoute,
    overlayLayer,
    restrooms,
    wifiSpots,
    setMapCenter,
    setMapZoom,
  } = useApp();

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return;

    import("leaflet").then((leaflet) => {
      L = leaflet.default ?? leaflet;

      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: mapZoom,
        zoomControl: false,
      });

      L.tileLayer(TILE_URL, { attribution: TILE_ATTR }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      layersRef.current = L.layerGroup().addTo(map);

      map.on("moveend", () => {
        const c = map.getCenter();
        setMapCenter({ lat: c.lat, lng: c.lng });
      });
      map.on("zoomend", () => {
        setMapZoom(map.getZoom());
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to user location
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
  }, [userLocation]);

  // Re-draw markers whenever state changes
  useEffect(() => {
    if (!mapRef.current || !L) return;
    const layers = layersRef.current;
    if (!layers) return;
    layers.clearLayers();

    // User location marker
    if (userLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:18px;height:18px;
          background:#2563EB;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 0 0 4px rgba(37,99,235,0.25);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon })
        .bindPopup("Your location")
        .addTo(layers);
    }

    // Stop markers
    stops.forEach((stop, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === stops.length - 1;
      const color = isFirst ? "#10B981" : isLast ? "#EF4444" : "#F59E0B";
      const label = isFirst ? "A" : isLast ? "Z" : String.fromCharCode(65 + idx);
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:32px;height:32px;
          background:${color};
          border:2px solid white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:700;font-size:13px;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        ">${label}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([stop.coords.lat, stop.coords.lng], { icon })
        .bindPopup(`<b>${stop.name}</b><br/>${stop.address}`)
        .addTo(layers);
    });

    // Route polyline
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    if (activeRoute && activeRoute.polyline.length > 1) {
      const latlngs = activeRoute.polyline.map(
        (p) => [p.lat, p.lng] as [number, number]
      );
      routeLayerRef.current = L.polyline(latlngs, {
        color: "#2563EB",
        weight: 5,
        opacity: 0.85,
        lineJoin: "round",
      }).addTo(mapRef.current!);
      mapRef.current!.fitBounds(routeLayerRef.current.getBounds(), {
        padding: [48, 48],
      });
    }

    // Restroom layer
    if (overlayLayer === "restroom") {
      restrooms.forEach((r) => {
        L.marker([r.coords.lat, r.coords.lng], {
          icon: createIcon("#8B5CF6", "🚻", 30),
        })
          .bindPopup(
            `<b>${r.name}</b><br/>${r.address}${r.accessible ? "<br/>♿ Accessible" : ""}`
          )
          .addTo(layers);
      });
    }

    // WiFi layer
    if (overlayLayer === "wifi") {
      wifiSpots.forEach((w) => {
        L.marker([w.coords.lat, w.coords.lng], {
          icon: createIcon(
            w.type === "free" ? "#10B981" : "#F59E0B",
            "📶",
            30
          ),
        })
          .bindPopup(
            `<b>${w.name}</b><br/>${w.address}<br/>${
              w.type === "free" ? "Free WiFi" : "Free with purchase"
            }`
          )
          .addTo(layers);
      });
    }
  }, [userLocation, stops, activeRoute, overlayLayer, restrooms, wifiSpots]);

  return <div ref={containerRef} className="w-full h-full" />;
}