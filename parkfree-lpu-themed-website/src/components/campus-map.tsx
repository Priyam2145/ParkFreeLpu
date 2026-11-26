"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { CAMPUS_BOUNDS, CAMPUS_BOUNDARY, CAMPUS_LANDMARKS, type ParkingLot } from "@/lib/parking";

type MapLot = ParkingLot & { liveAvailable: number };

type CampusMapProps = {
  lots: MapLot[];
  selectedLotId: string;
  onSelectLot: (lotId: string) => void;
  showLandmarks: boolean;
};

const CAMPUS_CENTER: [number, number] = [31.25335, 75.70325];

export default function CampusMap({ lots, selectedLotId, onSelectLot, showLandmarks }: CampusMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const selectCallbackRef = useRef(onSelectLot);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    selectCallbackRef.current = onSelectLot;
  }, [onSelectLot]);

  const fitCampus = useCallback(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet) return;

    map.fitBounds(
      leaflet.latLngBounds([
        [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
        [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east],
      ]),
      { padding: [34, 34], maxZoom: 16 },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((leaflet) => {
      if (cancelled || !mapElementRef.current) return;

      const map = leaflet.map(mapElementRef.current, {
        center: CAMPUS_CENTER,
        zoom: 14,
        minZoom: 12,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        preferCanvas: true,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          subdomains: ["a", "b", "c"],
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
        })
        .addTo(map);

      leaflet
        .polygon(CAMPUS_BOUNDARY, {
          color: "#c8102e",
          weight: 2,
          opacity: 0.72,
          fillColor: "#c8102e",
          fillOpacity: 0.055,
          dashArray: "8 7",
          interactive: false,
        })
        .addTo(map);

      mapRef.current = map;
      leafletRef.current = leaflet;
      map.fitBounds(
        leaflet.latLngBounds([
          [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
          [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east],
        ]),
        { padding: [34, 34], maxZoom: 16 },
      );
      setMapReady(true);
      window.requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      cancelled = true;
      markerLayerRef.current?.remove();
      markerLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!mapReady || !map || !leaflet) return;

    markerLayerRef.current?.remove();
    const layer = leaflet.layerGroup().addTo(map);

    for (const lot of lots) {
      const status = lot.liveAvailable === 0 ? "full" : lot.liveAvailable < 8 ? "low" : "open";
      const selected = lot.id === selectedLotId;
      const icon = leaflet.divIcon({
        className: "parking-marker-shell",
        html: `<span class="parking-marker ${selected ? "parking-marker--selected" : ""} parking-marker--${status}"><span class="parking-marker__pin"><span>P</span></span><span class="parking-marker__label"><b>${lot.liveAvailable}</b><small>free</small></span><span class="parking-marker__name">${lot.name}</span></span>`,
        iconSize: [150, 46],
        iconAnchor: [14, 33],
      });
      const marker = leaflet
        .marker([lot.latitude, lot.longitude], { icon, title: `${lot.name}: ${lot.liveAvailable} spaces available`, riseOnHover: true })
        .addTo(layer);
      marker.on("click", () => selectCallbackRef.current(lot.id));
    }

    if (showLandmarks) {
      for (const landmark of CAMPUS_LANDMARKS) {
        const icon = leaflet.divIcon({
          className: "campus-landmark-shell",
          html: `<span class="campus-landmark"><i></i><span>${landmark.name}</span></span>`,
          iconSize: [160, 22],
          iconAnchor: [4, 11],
        });
        leaflet
          .marker([landmark.latitude, landmark.longitude], {
            icon,
            title: `${landmark.name} · ${landmark.type}`,
            interactive: false,
            keyboard: false,
          })
          .addTo(layer);
      }
    }

    markerLayerRef.current = layer;
    return () => {
      layer.remove();
    };
  }, [lots, mapReady, selectedLotId, showLandmarks]);

  return (
    <div className="map-viewport">
      <div className="leaflet-map-canvas" ref={mapElementRef} aria-label="Interactive map of the Lovely Professional University campus" />
      <div className="map-place-label" aria-hidden="true">
        <span className="map-place-label__eyebrow">LOVELY PROFESSIONAL UNIVERSITY</span>
        <span className="map-place-label__location">Phagwara · Punjab</span>
      </div>
      <div className="map-zoom-controls" aria-label="Map controls">
        <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
          <span aria-hidden="true">+</span>
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
          <span aria-hidden="true">−</span>
        </button>
        <span className="map-control-divider" />
        <button type="button" aria-label="Fit full LPU campus" onClick={fitCampus}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M7 3H3v4M13 3h4v4M3 13v4h4m10-4v4h-4M3 7l5-4m9 4-5-4M3 13l5 4m9-4-5 4" />
          </svg>
        </button>
      </div>
      <div className="map-drag-hint" aria-hidden="true">
        <span className="map-drag-hint__crosshair">⌖</span> Drag to explore campus
      </div>
    </div>
  );
}
