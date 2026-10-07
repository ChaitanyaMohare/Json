'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Incident, Hotspot } from '../lib/api';
import {
  MapPin,
  CarIcon,
  BarrierIcon,
  RoadDamageIcon,
  FloodIcon,
  MoreHorizontal,
  Maximize2,
  Plus,
  Minus,
  ExternalLink,
  FlameIcon,
  AlertTriangle,
  Shield,
  Target
} from './Icons';

interface IncidentMapProps {
  incidents?: Incident[];
  singleIncident?: Incident;
  centerCoordinates?: [number, number]; // [lng, lat]
  zoom?: number;
  heightClass?: string;
  hotspots?: Hotspot[];
}

declare global {
  interface Window {
    mapboxgl: any;
  }
}

export default function IncidentMap({
  incidents = [],
  singleIncident,
  centerCoordinates,
  zoom = 11,
  heightClass = 'h-[360px]',
  hotspots = []
}: IncidentMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [activeMarker, setActiveMarker] = useState<Incident | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const displayIncidents = singleIncident ? [singleIncident] : incidents;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Default Bengaluru center as seen in screenshot
  const defaultCenter: [number, number] = centerCoordinates || (
    displayIncidents.length > 0 && displayIncidents[0].location?.coordinates
      ? [displayIncidents[0].location.coordinates[0], displayIncidents[0].location.coordinates[1]]
      : [77.5946, 12.9716]
  );

  // Load Mapbox GL JS if token exists
  useEffect(() => {
    if (!mapboxToken) return;

    if (window.mapboxgl) {
      setMapboxLoaded(true);
      return;
    }

    if (!document.getElementById('mapbox-gl-css')) {
      const link = document.createElement('link');
      link.id = 'mapbox-gl-css';
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('mapbox-gl-js')) {
      const script = document.createElement('script');
      script.id = 'mapbox-gl-js';
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.onload = () => setMapboxLoaded(true);
      document.body.appendChild(script);
    }
  }, [mapboxToken]);

  // Initialize Mapbox when token is available
  useEffect(() => {
    if (!mapboxToken || !mapboxLoaded || !mapContainerRef.current) return;

    try {
      window.mapboxgl.accessToken = mapboxToken;
      const map = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle === 'streets' ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/satellite-streets-v12',
        center: defaultCenter,
        zoom: zoom
      });

      map.on('load', () => {
        // Render Hotspots Layer (underneath markers) if hotspots are supplied
        if (hotspots && hotspots.length > 0) {
          try {
            const hotspotFeatures = hotspots.map((h) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [h.longitude, h.latitude]
              },
              properties: {
                id: h.id,
                areaName: h.areaName,
                riskScore: h.riskScore,
                riskLevel: h.riskLevel,
                incidentCount: h.incidentCount,
                color:
                  h.riskLevel === 'CRITICAL'
                    ? '#ef4444'
                    : h.riskLevel === 'HIGH'
                    ? '#f97316'
                    : h.riskLevel === 'MEDIUM'
                    ? '#eab308'
                    : '#10b981',
                radius:
                  h.riskLevel === 'CRITICAL'
                    ? 42
                    : h.riskLevel === 'HIGH'
                    ? 32
                    : h.riskLevel === 'MEDIUM'
                    ? 24
                    : 16
              }
            }));

            map.addSource('routeguard-hotspots', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: hotspotFeatures
              }
            });

            map.addLayer({
              id: 'hotspots-glow',
              type: 'circle',
              source: 'routeguard-hotspots',
              paint: {
                'circle-radius': ['get', 'radius'],
                'circle-color': ['get', 'color'],
                'circle-opacity': 0.28,
                'circle-stroke-width': 2,
                'circle-stroke-color': ['get', 'color'],
                'circle-stroke-opacity': 0.85
              }
            });

            map.on('click', 'hotspots-glow', (e: any) => {
              const feat = e.features?.[0];
              if (!feat) return;
              const props = feat.properties;
              new window.mapboxgl.Popup({ offset: 15 })
                .setLngLat(feat.geometry.coordinates)
                .setHTML(`
                  <div style="font-family: sans-serif; color: #1e293b; padding: 4px; min-width: 170px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${props.color};">${props.riskLevel} HOTSPOT</div>
                    <div style="font-weight: 700; font-size: 13px; margin: 2px 0;">${props.areaName}</div>
                    <div style="font-size: 11px; color: #64748b;">Risk Score: <b>${props.riskScore}</b></div>
                    <div style="font-size: 11px; color: #64748b;">Incidents: <b>${props.incidentCount}</b></div>
                  </div>
                `)
                .addTo(map);
            });
          } catch (e) {
            console.error('Error adding Mapbox hotspots layer:', e);
          }
        }

        displayIncidents.forEach((inc) => {
          if (!inc.location?.coordinates) return;
          const [lng, lat] = inc.location.coordinates;

          const color = inc.severity === 'HIGH' ? '#ef4444' : inc.severity === 'MEDIUM' ? '#f59e0b' : '#10b981';

          const el = document.createElement('div');
          el.className = 'cursor-pointer transition-transform hover:scale-125';
          el.innerHTML = `
            <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white;">
              <span style="font-size: 13px;">${inc.type === 'ACCIDENT' ? '🚗' : inc.type === 'FLOOD' ? '🌊' : inc.type === 'ROAD_BLOCK' ? '🚧' : '⚠️'}</span>
            </div>
          `;

          const popupHtml = `
            <div style="font-family: sans-serif; color: #1e293b; padding: 6px; min-width: 170px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px;">${inc.title}</div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${inc.type} • ${inc.severity}</div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Status: <b>${inc.status}</b></div>
              <a href="/admin/incidents/${inc._id}" style="display: inline-block; background: #2563eb; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 600;">View Details &rarr;</a>
            </div>
          `;

          const popup = new window.mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

          new window.mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });
      });

      mapInstanceRef.current = map;
      return () => map.remove();
    } catch (err) {
      console.error('Mapbox init error:', err);
    }
  }, [mapboxLoaded, mapboxToken, mapStyle, displayIncidents, defaultCenter, zoom, hotspots]);

  // Fallback interactive street view map matching screenshot
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs flex flex-col">
      {/* Top Map Bar matching screenshot */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-slate-800" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Live Incident & Hotspot Map</h2>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
            <FlameIcon className="w-3 h-3 text-rose-600" />
            {hotspots.length > 0 ? hotspots.length : 3} Hotspots Identified
          </span>
        </div>

        {/* Map / Satellite toggle & Fullscreen button */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mapStyle === 'streets' ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Map
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mapStyle === 'satellite' ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Satellite
            </button>
          </div>

          <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Surface */}
      <div className={`relative w-full ${heightClass} overflow-hidden bg-[#e8ecef]`}>
        {mapboxToken ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* SVG Street Map Canvas depicting Bengaluru matching screenshot */
          <div className="relative w-full h-full bg-[#eef1ed] overflow-hidden select-none">
            {/* Water features & greenery paths */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <path d="M0,80 Q140,120 280,60 T600,100 T1200,80" fill="none" stroke="#d5e8db" strokeWidth="40" />
              <path d="M-20,240 Q180,200 420,280 T900,230 T1300,260" fill="none" stroke="#d8ebdf" strokeWidth="30" />
              {/* Roads / Highways */}
              <line x1="0" y1="180" x2="1200" y2="180" stroke="#fde047" strokeWidth="8" opacity="0.8" />
              <line x1="0" y1="180" x2="1200" y2="180" stroke="#fbbf24" strokeWidth="3" />
              <line x1="450" y1="0" x2="450" y2="600" stroke="#fde047" strokeWidth="8" opacity="0.8" />
              <line x1="450" y1="0" x2="450" y2="600" stroke="#fbbf24" strokeWidth="3" />
              <path d="M100,0 C300,180 500,200 800,400" fill="none" stroke="#ffffff" strokeWidth="6" />
              <path d="M700,0 C650,220 300,350 200,600" fill="none" stroke="#ffffff" strokeWidth="6" />
              <path d="M0,320 C350,300 700,280 1200,340" fill="none" stroke="#ffffff" strokeWidth="5" />
            </svg>

            {/* Area Labels (Bengaluru landmarks matching screenshot) */}
            <div className="absolute top-10 left-[38%] text-[11px] font-bold text-slate-500 tracking-wider">YELAHANKA</div>
            <div className="absolute top-16 left-[46%] text-[10px] font-semibold text-slate-400">HEBBAL</div>
            <div className="absolute top-24 left-[28%] text-[11px] font-semibold text-slate-400">JALAHALLI</div>
            <div className="absolute top-36 left-[56%] text-[10px] font-semibold text-slate-400">KR PURAM</div>
            <div className="absolute top-44 left-[68%] text-[11px] font-semibold text-slate-400">WHITEFIELD</div>
            <div className="absolute top-48 left-[40%] text-sm font-extrabold text-slate-800 tracking-wide">Bengaluru</div>
            <div className="absolute bottom-16 left-[50%] text-[11px] font-semibold text-slate-400">KORAMANGALA</div>
            <div className="absolute bottom-12 left-[30%] text-[10px] font-semibold text-slate-400">BANASHANKARI</div>
            <div className="absolute bottom-10 left-[18%] text-[11px] font-semibold text-slate-400">KENGERI</div>

            {/* Hotspot Risk Concentration Zones Layer (rendered beneath markers) */}
            <div className="absolute inset-0 pointer-events-none">
              {hotspots.map((hs, index) => {
                const minLng = 77.52, maxLng = 77.75, minLat = 12.89, maxLat = 13.08;
                const hasGeo = hs.longitude && hs.latitude;
                const leftPct = hasGeo
                  ? Math.min(84, Math.max(16, ((hs.longitude - minLng) / (maxLng - minLng)) * 100))
                  : (25 + (index * 22) % 60);
                const topPct = hasGeo
                  ? Math.min(84, Math.max(16, (1 - ((hs.latitude - minLat) / (maxLat - minLat))) * 100))
                  : (30 + (index * 18) % 55);

                const isCrit = hs.riskLevel === 'CRITICAL';
                const isHigh = hs.riskLevel === 'HIGH';
                const isMed = hs.riskLevel === 'MEDIUM';

                const ringStyle = isCrit
                  ? 'w-28 h-28 border-red-500 bg-red-500/15 ring-red-400/30'
                  : isHigh
                  ? 'w-24 h-24 border-orange-500 bg-orange-500/15 ring-orange-400/30'
                  : isMed
                  ? 'w-20 h-20 border-amber-500 bg-amber-500/15 ring-amber-400/30'
                  : 'w-16 h-16 border-emerald-500 bg-emerald-500/10 ring-emerald-400/20';

                return (
                  <div
                    key={hs.id}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group z-0"
                    onClick={() => setActiveHotspot(hs)}
                  >
                    <div className={`relative ${ringStyle} rounded-full border-2 border-dashed ring-4 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                      {(isCrit || isHigh) && (
                        <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping opacity-25 pointer-events-none" />
                      )}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm ${
                        isCrit
                          ? 'bg-red-600 text-white'
                          : isHigh
                          ? 'bg-orange-600 text-white'
                          : isMed
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {hs.riskLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rendered Incident Markers matching screenshot */}
            <div className="absolute inset-0">
              {displayIncidents.length > 0 ? (
                displayIncidents.map((inc, index) => {
                  // Coordinate positions on mock canvas
                  const positions = [
                    { top: '34%', left: '42%' },
                    { top: '38%', left: '54%' },
                    { top: '36%', left: '32%' },
                    { top: '56%', left: '35%' },
                    { top: '64%', left: '50%' },
                    { top: '54%', left: '58%' },
                    { top: '68%', left: '57%' },
                  ];
                  const pos = positions[index % positions.length];

                  const isHigh = inc.severity === 'HIGH' || inc.type === 'ACCIDENT';
                  const isMedium = inc.severity === 'MEDIUM';
                  const isFlood = inc.type === 'FLOOD';
                  const isBlock = inc.type === 'ROAD_BLOCK';

                  const bgColor = isHigh ? 'bg-[#ef4444]' : isFlood ? 'bg-[#2563eb]' : isBlock ? 'bg-[#f59e0b]' : 'bg-[#eab308]';

                  return (
                    <div
                      key={inc._id}
                      style={{ top: pos.top, left: pos.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform hover:scale-125"
                      onClick={() => setActiveMarker(inc)}
                    >
                      <div className={`w-7 h-7 rounded-full ${bgColor} text-white flex items-center justify-center shadow-md ring-2 ring-white`}>
                        {inc.type === 'ACCIDENT' ? (
                          <CarIcon className="w-3.5 h-3.5" />
                        ) : inc.type === 'ROAD_BLOCK' ? (
                          <BarrierIcon className="w-3.5 h-3.5" />
                        ) : inc.type === 'FLOOD' ? (
                          <FloodIcon className="w-3.5 h-3.5" />
                        ) : (
                          <RoadDamageIcon className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No incidents plotted on map
                </div>
              )}
            </div>

            {/* Bottom-left Legend matching screenshot */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                Low
              </span>
            </div>

            {/* Bottom-right Zoom & Target Controls matching screenshot */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
              <div className="flex flex-col rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden">
                <button className="p-2 hover:bg-slate-50 text-slate-700 border-b border-slate-100 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-50 text-slate-700 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              <button className="p-2 rounded-xl bg-white shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
                <Target className="w-4 h-4" />
              </button>
            </div>

            {/* Mapbox Logo & Attribution */}
            <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[11px] font-bold text-slate-600">
              <span className="font-sans">mapbox</span>
            </div>
            <div className="absolute bottom-1 right-3 text-[10px] text-slate-400 bg-white/70 px-1.5 rounded">
              © Mapbox © OpenStreetMap
            </div>

            {/* Active Hotspot Popup Drawer */}
            {activeHotspot && (
              <div className="absolute top-4 right-4 max-w-xs bg-white rounded-xl shadow-xl border border-red-200 p-3.5 z-30 animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 flex items-center gap-1">
                      <FlameIcon className="w-3 h-3 text-red-500" /> {activeHotspot.riskLevel} RISK HOTSPOT
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">
                      {activeHotspot.areaName}
                    </h4>
                  </div>
                  <button onClick={() => setActiveHotspot(null)} className="text-slate-400 hover:text-slate-700 text-xs p-1">
                    ✕
                  </button>
                </div>
                <div className="mt-2 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <span className="font-black text-red-600">{activeHotspot.riskScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incidents:</span>
                    <span className="font-semibold text-slate-800">{activeHotspot.incidentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Severity:</span>
                    <span className="font-semibold text-red-600">{activeHotspot.highSeverityCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Hazards:</span>
                    <span className="font-semibold text-emerald-600">{activeHotspot.activeCount}</span>
                  </div>
                </div>
                {activeHotspot.topHazards?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                    {activeHotspot.topHazards.map((h) => (
                      <span key={h} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Marker Popup Drawer */}
            {activeMarker && (
              <div className="absolute top-4 left-4 max-w-xs bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-30 animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      {activeMarker.type} • {activeMarker.severity}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">
                      {activeMarker.title}
                    </h4>
                  </div>
                  <button onClick={() => setActiveMarker(null)} className="text-slate-400 hover:text-slate-700 text-xs p-1">
                    ✕
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Status: <span className="font-semibold text-slate-700">{activeMarker.status}</span>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/admin/incidents/${activeMarker._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

