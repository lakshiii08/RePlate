'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Compass,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Phone,
  Building2,
  MapPin,
  Utensils,
  ChevronRight,
  ChevronDown,
  Layers,
  Locate,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  FastForward,
  ShieldCheck,
  Clock,
  Gauge,
  ListOrdered,
  X,
} from 'lucide-react';

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiamF0aW4xMTEyIiwiYSI6ImNtdWEycWF2djB5cjcyeXM5ZHg3MnQ1bjkifQ.mWhTcaDNa-ySEszTwb42zg';

export interface NavigatorWaypoint {
  name: string;
  address: string;
  coords: [number, number]; // [lat, lng]
  phone?: string;
  role: 'ORIGIN' | 'PICKUP' | 'DROPOFF';
  notes?: string;
}

export interface InAppNavigatorProps {
  origin?: NavigatorWaypoint;
  pickup?: NavigatorWaypoint;
  dropoff?: NavigatorWaypoint;
  currentLeg?: 'TO_PICKUP' | 'TO_DROPOFF';
  onArrived?: (leg: 'TO_PICKUP' | 'TO_DROPOFF') => void;
  height?: string;
  mapId?: string;
}

export default function InAppNavigator({
  origin = {
    name: 'Courier Hub & Staging Station',
    address: 'San Francisco Downtown Central Logistics Hub',
    coords: [37.783, -122.408],
    role: 'ORIGIN',
  },
  pickup = {
    name: 'Grand Hyatt Catering Dock',
    address: '345 Embarcadero Plaza, Financial District, SF',
    coords: [37.7925, -122.3995],
    phone: '+1 (555) 234-5678',
    role: 'PICKUP',
    notes: 'Enter through Service Bay 3. Staff contact: Chef Marcus.',
  },
  dropoff = {
    name: 'Hope Community Kitchen & Shelter',
    address: '452 Elm Street, Tenderloin, San Francisco, CA',
    coords: [37.7749, -122.4194],
    phone: '+1 (415) 890-4432',
    role: 'DROPOFF',
    notes: 'Ring buzzer at cold storage receiver intake dock.',
  },
  currentLeg = 'TO_PICKUP',
  onArrived,
  height = '620px',
  mapId = 'in-app-navigator-map',
}: InAppNavigatorProps) {
  const [mounted, setMounted] = useState(false);
  const [LInstance, setLInstance] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const vehicleMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  // Active leg: 'TO_PICKUP' or 'TO_DROPOFF'
  const [activeLeg, setActiveLeg] = useState<'TO_PICKUP' | 'TO_DROPOFF'>(currentLeg);

  // Route Data from Mapbox
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]); // [lat, lng]
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState(0);
  const [routeDurationMin, setRouteDurationMin] = useState(0);
  const [loadingRoute, setLoadingRoute] = useState(true);

  // Simulation & Driving State
  const [isNavigating, setIsNavigating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(2);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [vehicleIndex, setVehicleIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [vehicleCoords, setVehicleCoords] = useState<[number, number]>(origin.coords);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  const [showStepsList, setShowStepsList] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Determine source and target for active leg
  const startWaypoint = activeLeg === 'TO_PICKUP' ? origin : pickup;
  const targetWaypoint = activeLeg === 'TO_PICKUP' ? pickup : dropoff;

  // Initialize Leaflet client-side
  useEffect(() => {
    setMounted(true);
    import('leaflet').then((L) => {
      setLInstance(L.default || L);
    });
  }, []);

  // Fetch real Mapbox Driving route
  useEffect(() => {
    let isCancelled = false;
    async function fetchMapboxRoute() {
      setLoadingRoute(true);
      const [startLat, startLng] = startWaypoint.coords;
      const [endLat, endLng] = targetWaypoint.coords;

      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&steps=true&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!isCancelled && data.routes && data.routes.length > 0) {
          const primaryRoute = data.routes[0];
          // GeoJSON coordinates are [lng, lat] -> convert to [lat, lng] for Leaflet
          const coords: [number, number][] = primaryRoute.geometry.coordinates.map(
            (pt: [number, number]) => [pt[1], pt[0]]
          );
          setRouteCoordinates(coords);
          setRouteSteps(primaryRoute.legs[0]?.steps || []);
          setRouteDistanceKm(Math.round((primaryRoute.distance / 1000) * 10) / 10);
          setRouteDurationMin(Math.max(1, Math.round(primaryRoute.duration / 60)));

          // Reset navigation
          setVehicleCoords(coords[0] || startWaypoint.coords);
          setVehicleIndex(0);
          setCurrentStepIndex(0);
          setHasArrived(false);
        }
      } catch (err) {
        console.warn('Mapbox route fetch failed, using fallback corridor:', err);
        // Fallback interpolation
        const coords: [number, number][] = [
          startWaypoint.coords,
          [(startWaypoint.coords[0] + targetWaypoint.coords[0]) / 2 + 0.005, (startWaypoint.coords[1] + targetWaypoint.coords[1]) / 2 - 0.004],
          targetWaypoint.coords,
        ];
        setRouteCoordinates(coords);
        setRouteDistanceKm(3.8);
        setRouteDurationMin(12);
        setRouteSteps([
          { maneuver: { instruction: 'Head towards destination corridor', modifier: 'straight' }, distance: 1200, duration: 180 },
          { maneuver: { instruction: 'Turn right towards facility entrance', modifier: 'right' }, distance: 2100, duration: 320 },
          { maneuver: { instruction: 'Arrive at intake docking bay', modifier: 'arrive' }, distance: 500, duration: 80 },
        ]);
        setVehicleCoords(startWaypoint.coords);
      } finally {
        if (!isCancelled) setLoadingRoute(false);
      }
    }

    fetchMapboxRoute();
    return () => {
      isCancelled = true;
    };
  }, [startWaypoint, targetWaypoint, activeLeg]);

  // Voice Speech Synthesis Prompt
  const speakInstruction = (instructionText: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(instructionText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Voice guidance unavailable', e);
    }
  };

  // Build Leaflet Map
  useEffect(() => {
    if (!mounted || !LInstance) return;

    const mapContainer = document.getElementById(mapId);
    if (!mapContainer) return;

    if ((mapContainer as any)._leaflet_id) {
      (mapContainer as any)._leaflet_id = null;
      mapContainer.innerHTML = '';
    }

    const map = LInstance.map(mapId, {
      center: startWaypoint.coords,
      zoom: 14,
      zoomControl: false,
    });
    mapRef.current = map;

    // Mapbox Navigation Day Tiles
    const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
    LInstance.tileLayer(tileUrl, {
      attribution: '&copy; Mapbox &copy; OpenStreetMap',
      maxZoom: 19,
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map);

    // Zoom controls bottom right
    LInstance.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
    };
  }, [mounted, LInstance]);

  // Update Route Polyline and Markers on Map
  useEffect(() => {
    if (!mapRef.current || !LInstance || routeCoordinates.length === 0) return;
    const map = mapRef.current;

    // Remove existing polyline if any
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    // 1. Draw glowing route polyline
    const polyline = LInstance.polyline(routeCoordinates, {
      color: activeLeg === 'TO_PICKUP' ? '#059669' : '#2563eb',
      weight: 6,
      opacity: 0.9,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map);
    routePolylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [60, 60] });

    // Custom Icon Maker
    const createPin = (emoji: string, bg: string, label: string) => {
      return LInstance.divIcon({
        className: 'custom-nav-pin',
        html: `
          <div style="
            background: ${bg};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            border: 3px solid white;
            position: relative;
          ">
            ${emoji}
            <span style="
              position: absolute;
              bottom: -22px;
              background: #0f172a;
              color: white;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 6px;
              border-radius: 6px;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.2);
            ">${label}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    };

    // Add Start & Destination markers
    LInstance.marker(startWaypoint.coords, {
      icon: createPin(
        activeLeg === 'TO_PICKUP' ? '🚚' : '🍲',
        activeLeg === 'TO_PICKUP' ? '#047857' : '#059669',
        activeLeg === 'TO_PICKUP' ? 'Hub' : 'Kitchen'
      ),
    })
      .addTo(map)
      .bindPopup(`<b>${startWaypoint.name}</b><br/><span style="font-size:11px;">${startWaypoint.address}</span>`);

    LInstance.marker(targetWaypoint.coords, {
      icon: createPin(
        activeLeg === 'TO_PICKUP' ? '🍲' : '🏠',
        activeLeg === 'TO_PICKUP' ? '#059669' : '#2563eb',
        activeLeg === 'TO_PICKUP' ? 'Pickup' : 'Shelter Dock'
      ),
    })
      .addTo(map)
      .bindPopup(`<b>${targetWaypoint.name}</b><br/><span style="font-size:11px;">${targetWaypoint.address}</span>`);

    // Vehicle Marker with 3D Navigation Arrow
    const vehicleIcon = LInstance.divIcon({
      className: 'vehicle-nav-cursor',
      html: `
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #0f172a;
          border: 3px solid #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 18px rgba(16, 185, 129, 0.7);
          transition: transform 0.2s ease-out;
        ">
          <span style="font-size: 20px;">🚚</span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (vehicleMarkerRef.current) {
      map.removeLayer(vehicleMarkerRef.current);
    }
    const vMarker = LInstance.marker(vehicleCoords, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarkerRef.current = vMarker;
  }, [mounted, LInstance, routeCoordinates, activeLeg]);

  // Simulation Driving Loop
  useEffect(() => {
    if (!isNavigating || hasArrived || routeCoordinates.length === 0) {
      setCurrentSpeedKmh(0);
      return;
    }

    const intervalTime = Math.max(150, 450 / simSpeed);

    const timer = setInterval(() => {
      setVehicleIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;

        if (nextIdx >= routeCoordinates.length) {
          // Arrived!
          setHasArrived(true);
          setIsNavigating(false);
          setCurrentSpeedKmh(0);
          speakInstruction(`You have arrived at your destination: ${targetWaypoint.name}.`);
          if (onArrived) onArrived(activeLeg);
          return prevIdx;
        }

        const nextPoint = routeCoordinates[nextIdx];
        setVehicleCoords(nextPoint);
        setCurrentSpeedKmh(Math.floor(28 + Math.random() * 12));

        // Update Vehicle Marker position on Leaflet
        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng(nextPoint);
        }

        // Auto-center map on vehicle
        if (mapRef.current) {
          mapRef.current.panTo(nextPoint, { animate: true, duration: 0.3 });
        }

        // Progressively advance turn-by-turn guidance
        const progressRatio = nextIdx / routeCoordinates.length;
        const estimatedStep = Math.min(
          routeSteps.length - 1,
          Math.floor(progressRatio * routeSteps.length)
        );

        if (estimatedStep !== currentStepIndex) {
          setCurrentStepIndex(estimatedStep);
          const currentInstruction = routeSteps[estimatedStep]?.maneuver?.instruction || 'Continue straight';
          speakInstruction(currentInstruction);
        }

        return nextIdx;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isNavigating, hasArrived, routeCoordinates, simSpeed, routeSteps, currentStepIndex, activeLeg]);

  // Real GPS Geolocation Tracker
  const handleToggleGps = () => {
    if (isGpsActive) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setIsGpsActive(false);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsNavigating(false); // Stop simulation if using real GPS
    setIsGpsActive(true);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newCoords: [number, number] = [lat, lng];
        setVehicleCoords(newCoords);
        setCurrentSpeedKmh(Math.round((pos.coords.speed || 0) * 3.6));

        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng(newCoords);
        }
        if (mapRef.current) {
          mapRef.current.panTo(newCoords, { animate: true });
        }
      },
      (err) => {
        console.error('GPS tracking error:', err);
        setIsGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
    watchIdRef.current = watchId;
  };

  // Recenter on Vehicle
  const handleRecenter = () => {
    if (mapRef.current && vehicleCoords) {
      mapRef.current.setView(vehicleCoords, 16, { animate: true });
    }
  };

  // Toggle Driving Simulation
  const handleToggleSimulation = () => {
    if (hasArrived) {
      // Reset
      setVehicleIndex(0);
      setVehicleCoords(routeCoordinates[0] || startWaypoint.coords);
      setCurrentStepIndex(0);
      setHasArrived(false);
      setIsNavigating(true);
      speakInstruction(`Starting navigation towards ${targetWaypoint.name}.`);
    } else {
      const nextNav = !isNavigating;
      setIsNavigating(nextNav);
      if (nextNav) {
        setIsGpsActive(false);
        const currInstruction = routeSteps[currentStepIndex]?.maneuver?.instruction || `Head towards ${targetWaypoint.name}`;
        speakInstruction(currInstruction);
      }
    }
  };

  // Dynamic Turn Instruction Helpers
  const activeStep = routeSteps[currentStepIndex] || routeSteps[0] || {
    maneuver: { instruction: `Head towards ${targetWaypoint.name}` },
    distance: 400,
  };
  const nextStep = routeSteps[currentStepIndex + 1];

  const getManeuverIcon = (instruction: string = '') => {
    const lower = instruction.toLowerCase();
    if (lower.includes('left')) return <CornerUpLeft className="w-8 h-8 text-white" />;
    if (lower.includes('right')) return <CornerUpRight className="w-8 h-8 text-white" />;
    if (lower.includes('arrive') || lower.includes('destination')) return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
    return <ArrowUp className="w-8 h-8 text-white" />;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 text-white select-none">
      {/* 1. TOP FLOATING IN-APP NAVIGATION HUD (Turn-by-Turn Guidance Banner) */}
      <div className="absolute top-4 left-4 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-slate-950/92 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {/* Maneuver Icon */}
            <div className="w-13 h-13 rounded-2xl bg-emerald-600/90 flex items-center justify-center shadow-lg shrink-0">
              {getManeuverIcon(activeStep.maneuver?.instruction)}
            </div>

            {/* Instruction Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-sm uppercase tracking-wider">
                  In {Math.round(activeStep.distance || 300)} m
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                  Step {currentStepIndex + 1} of {routeSteps.length || 1}
                </span>
              </div>
              <h2 className="text-base font-black text-white truncate leading-snug">
                {activeStep.maneuver?.instruction || `Proceed towards ${targetWaypoint.name}`}
              </h2>
              {nextStep && (
                <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <span className="text-slate-500 font-semibold">Then:</span>
                  <span>{nextStep.maneuver?.instruction}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Voice & Leg Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Mute voice audio guidance' : 'Unmute voice audio guidance'}
              className={`p-2.5 rounded-xl border transition-all ${
                voiceEnabled
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowStepsList(!showStepsList)}
              title="View all turns"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <ListOrdered className="w-4 h-4" />
              <span className="hidden sm:inline">Turns</span>
            </button>
          </div>
        </div>

        {/* Arrival Celebration Banner */}
        {hasArrived && (
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <div>
                <span className="font-extrabold text-xs block">Destination Dock Reached!</span>
                <span className="text-[11px] text-emerald-100">
                  {activeLeg === 'TO_PICKUP'
                    ? 'Present Pickup PIN to donor kitchen staff to load surplus trays.'
                    : 'Present Delivery PIN to shelter intake officer for handover verification.'}
                </span>
              </div>
            </div>

            {activeLeg === 'TO_PICKUP' && (
              <button
                onClick={() => {
                  setActiveLeg('TO_DROPOFF');
                  setHasArrived(false);
                }}
                className="px-3.5 py-1.5 bg-white text-emerald-900 rounded-xl text-xs font-black shadow-sm hover:bg-emerald-50 transition-all shrink-0 ml-2"
              >
                Proceed to Shelter Dock &rarr;
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. MAP CONTAINER */}
      <div
        id={mapId}
        style={{ height }}
        className="w-full z-10 bg-slate-950"
      />

      {/* Loading Overlay */}
      {loadingRoute && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-white tracking-wide">
            Calculating Mapbox street routing & turns...
          </p>
        </div>
      )}

      {/* 3. RIGHT FLOATING MAP CONTROLS */}
      <div className="absolute right-4 bottom-24 z-40 flex flex-col gap-2 pointer-events-auto">
        {/* Recenter on Vehicle */}
        <button
          onClick={handleRecenter}
          title="Recenter on Courier Vehicle"
          className="w-11 h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-all"
        >
          <Locate className="w-5 h-5 text-emerald-400" />
        </button>

        {/* GPS Live Geolocation */}
        <button
          onClick={handleToggleGps}
          title="Track Real Device GPS"
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-lg transition-all ${
            isGpsActive
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/50'
              : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700'
          }`}
        >
          <Compass className={`w-5 h-5 ${isGpsActive ? 'animate-spin text-white' : 'text-slate-400'}`} />
        </button>

        {/* Leg Switcher Tab */}
        <button
          onClick={() => {
            const next = activeLeg === 'TO_PICKUP' ? 'TO_DROPOFF' : 'TO_PICKUP';
            setActiveLeg(next);
            setHasArrived(false);
          }}
          title="Switch Navigation Leg"
          className="w-11 h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-all text-xs font-black"
        >
          {activeLeg === 'TO_PICKUP' ? '1/2' : '2/2'}
        </button>
      </div>

      {/* 4. EXPANDABLE ALL-TURNS LIST DRAWER */}
      {showStepsList && (
        <div className="absolute top-24 left-4 right-4 z-40 max-h-[360px] bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-y-auto animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4" />
              Full Turn-by-Turn Manifest ({routeSteps.length} Steps)
            </h3>
            <button
              onClick={() => setShowStepsList(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {routeSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  idx === currentStepIndex
                    ? 'bg-emerald-950/50 border-emerald-600/70 text-white font-bold'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{step.maneuver?.instruction || 'Continue'}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {Math.round(step.distance)} m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BOTTOM TRIP TELEMETRY & SIMULATOR CONTROLS BAR */}
      <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Telemetry (ETA, Remaining Distance, Speed) */}
        <div className="md:col-span-6 flex items-center gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Remaining ETA</span>
            <div className="text-xl font-black text-emerald-400 flex items-baseline gap-1">
              <span>{hasArrived ? '0' : routeDurationMin}</span>
              <span className="text-xs text-slate-400 font-bold">mins</span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-800" />

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Distance</span>
            <div className="text-xl font-black text-white flex items-baseline gap-1">
              <span>{hasArrived ? '0.0' : routeDistanceKm}</span>
              <span className="text-xs text-slate-400 font-bold">km</span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-800" />

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Vehicle Speed</span>
            <div className="text-xl font-black text-white flex items-baseline gap-1">
              <span className="font-mono text-emerald-400">{currentSpeedKmh}</span>
              <span className="text-xs text-slate-400 font-bold">km/h</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Leg</span>
            <span className="text-xs font-bold text-slate-300">
              {activeLeg === 'TO_PICKUP' ? '1/2 (To Kitchen)' : '2/2 (To Shelter)'}
            </span>
          </div>
        </div>

        {/* Right Controls: Play / Pause Simulation, Speed Multiplier */}
        <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2.5">
          {/* Speed multiplier */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex items-center">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSimSpeed(spd as any)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  simSpeed === spd
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Start / Pause In-App Drive Simulation */}
          <button
            type="button"
            onClick={handleToggleSimulation}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-98 ${
              isNavigating
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isNavigating ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Navigation</span>
              </>
            ) : hasArrived ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Restart Drive</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start In-App Drive</span>
              </>
            )}
          </button>

          {/* Quick Call Button */}
          {targetWaypoint.phone && (
            <a
              href={`tel:${targetWaypoint.phone}`}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title={`Call ${targetWaypoint.name}`}
            >
              <Phone className="w-4 h-4 text-emerald-400" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
