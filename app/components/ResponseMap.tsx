"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Incident } from "../../lib/data";

const colors: Record<Incident["severity"], string> = {
  "Crítica": "#e4573f",
  "Alta": "#e69d32",
  "Media": "#d4b84f",
  "Operativa": "#46a982",
};

export function ResponseMap({ incidents, selectedId, onSelect }: { incidents: Incident[]; selectedId: string; onSelect: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    let disposed = false;
    let createdMap: MapLibreMap | null = null;
    const markerStore = markersRef.current;

    void import("maplibre-gl").then((maplibregl) => {
      if (disposed || !container.current) return;
      const map = new maplibregl.Map({
        container: container.current,
        center: [-75.75, 4.75],
        zoom: 5.7,
        minZoom: 4.5,
        maxZoom: 14,
        attributionControl: false,
        style: {
          version: 8,
          sources: {
            osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" },
          },
          layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.88, "raster-contrast": 0.18, "raster-brightness-min": 0.16, "raster-brightness-max": 0.62 } }],
        },
      });
      createdMap = map;
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

      incidents.forEach((incident) => {
        const element = document.createElement("button");
        element.className = `map-marker ${incident.id === selectedIdRef.current ? "selected" : ""}`;
        element.style.setProperty("--marker-color", colors[incident.severity]);
        element.setAttribute("aria-label", `${incident.title}, ${incident.municipality}`);
        element.addEventListener("click", () => onSelect(incident.id));
        const marker = new maplibregl.Marker({ element }).setLngLat(incident.coordinates).addTo(map);
        markerStore.set(incident.id, marker);
      });
    });

    return () => {
      disposed = true;
      markerStore.clear();
      createdMap?.remove();
      if (mapRef.current === createdMap) mapRef.current = null;
    };
  }, [incidents, onSelect]);

  useEffect(() => {
    const selected = incidents.find((incident) => incident.id === selectedId);
    markersRef.current.forEach((marker, id) => marker.getElement().classList.toggle("selected", id === selectedId));
    if (selected && mapRef.current) mapRef.current.flyTo({ center: selected.coordinates, zoom: Math.max(mapRef.current.getZoom(), 7), duration: 750 });
  }, [incidents, selectedId]);

  return <div ref={container} className="map-canvas" aria-label="Mapa interactivo de registros de demostración" />;
}
