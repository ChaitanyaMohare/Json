'use client';

import React, { useEffect, useState } from 'react';
import { getIncidents, Incident } from '../../../lib/api';
import IncidentMap from '../../../components/IncidentMap';
import { MapIcon, RefreshCw, AlertTriangle } from '../../../components/Icons';

export default function MapViewPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const incData = await getIncidents();
      setIncidents(incData);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <MapIcon className="w-4 h-4" />
            </span>
            Live Tactical Road Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full geospatial visualization of active incidents, road hazards, and corroborated threats.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            Active Hazards ({incidents.length})
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh Map Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-210px)] min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white relative">
        <IncidentMap
          incidents={incidents}
          centerCoordinates={[77.5946, 12.9716]}
          zoom={12}
          heightClass="h-full min-h-[500px]"
        />
      </div>
    </div>
  );
}
