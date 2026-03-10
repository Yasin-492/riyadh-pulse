"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import type { Coordinate } from "@/types/navigation";

type LineFeature = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
  properties: Record<string, never>;
};

type MapViewProps = {
  currentPosition: Coordinate | null;
  origin: Coordinate | null;
  destination: Coordinate | null;
  routeLine: Coordinate[];
};

type MapLibreMarker = {
  addTo: (map: MapLibreMap) => void;
  getElement: () => HTMLElement;
  setLngLat: (lngLat: [number, number]) => MapLibreMarker;
};

type GeoJSONSource = {
  setData: (data: LineFeature) => void;
};

type MapLibreMap = {
  isStyleLoaded: () => boolean;
  addControl: (control: unknown, position?: string) => void;
  once: (event: "load", listener: () => void) => void;
  addSource: (id: string, source: { type: "geojson"; data: LineFeature }) => void;
  getSource: (id: string) => GeoJSONSource | undefined;
  addLayer: (layer: {
    id: string;
    type: "line";
    source: string;
    paint: Record<string, string | number>;
  }) => void;
  getContainer: () => HTMLElement;
  remove: () => void;
};

function getMapLibre() {
  if (typeof window === "undefined") return null;
  return window.maplibregl ?? null;
}

export function MapView({ currentPosition, origin, destination, routeLine }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    const maplibre = getMapLibre();
    if (!mapContainerRef.current || mapRef.current || !maplibre) return;

    mapRef.current = new maplibre.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [DEFAULT_MAP_CENTER.longitude, DEFAULT_MAP_CENTER.latitude],
      zoom: DEFAULT_MAP_ZOOM,
      attributionControl: false,
    }) as MapLibreMap;

    mapRef.current.addControl(new maplibre.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const maplibre = getMapLibre();
    if (!mapRef.current || !maplibre || !mapRef.current.isStyleLoaded()) return;

    const map = mapRef.current;
    const upsertMarker = (id: string, coordinate: Coordinate | null, color: string) => {
      if (!coordinate) return;
      const marker = new maplibre.Marker({ color }) as MapLibreMarker;
      marker.setLngLat([coordinate.longitude, coordinate.latitude]).addTo(map);
      marker.getElement().dataset.markerId = id;
    };

    map.getContainer().querySelectorAll("[data-marker-id]").forEach((node) => node.remove());
    upsertMarker("origin", origin, "#1d4ed8");
    upsertMarker("destination", destination, "#dc2626");
    upsertMarker("position", currentPosition, "#059669");
  }, [currentPosition, destination, origin]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const sourceId = "route-line-source";

    const data: LineFeature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: routeLine.map((point) => [point.longitude, point.latitude]),
      },
      properties: {},
    };

    const addOrUpdate = () => {
      const source = map.getSource(sourceId);
      if (!source) {
        map.addSource(sourceId, { type: "geojson", data });
        map.addLayer({
          id: "route-line-layer",
          type: "line",
          source: sourceId,
          paint: { "line-color": "#0f766e", "line-width": 5 },
        });
        return;
      }
      source.setData(data);
    };

    if (map.isStyleLoaded()) addOrUpdate();
    else map.once("load", addOrUpdate);
  }, [routeLine]);

  return <div ref={mapContainerRef} className="h-full w-full rounded-2xl" />;
}
