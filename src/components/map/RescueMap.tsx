'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Donation, Shelter, Driver } from '@/types';
import { realtimeEngine } from '@/services/realtime';
import 'leaflet/dist/leaflet.css';

interface RescueMapProps {
  donations?: Donation[];
  shelters?: Shelter[];
  drivers?: Driver[];
  activeDonationId?: string;
  mode?: 'DRIVER_APPROACH' | 'NGO_DESTINATION' | 'ALL';
  zoom?: number;
  center?: [number, number];
  height?: string;
  interactive?: boolean;
}

export default function RescueMap({
  donations = [],
  shelters = [],
  drivers = [],
  activeDonationId,
  mode,
  zoom = 13,
  center = [37.7749, -122.4194],
  height = '100%',
  interactive = true,
}: RescueMapProps) {
  const [mounted, setMounted] = useState(false);
  const [LInstance, setLInstance] = useState<any>(null);
  const [mapObj, setMapObj] = useState<any>(null);
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((L) => {
      setLInstance(L.default || L);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !LInstance) return;

    const mapElement = document.getElementById('replate-leaflet-map');
    if (!mapElement) return;

    // Clean existing map instance if any
    if ((mapElement as any)._leaflet_id) {
      (mapElement as any)._leaflet_id = null;
      mapElement.innerHTML = '';
    }

    const activeDonation = donations.find((d) => d.id === activeDonationId) || donations[0];
    const initialCenter = activeDonation?.donorCoords || center;

    const map = LInstance.map('replate-leaflet-map', {
      center: initialCenter,
      zoom: zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
    });

    setMapObj(map);

    // Mapbox Street Vector-Raster Tiles with Fallback
    const mapboxToken =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      'pk.eyJ1IjoiamF0aW4xMTEyIiwiYSI6ImNtdWEycWF2djB5cjcyeXM5ZHg3MnQ1bjkifQ.mWhTcaDNa-ySEszTwb42zg';

    const tileUrl = mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    LInstance.tileLayer(tileUrl, {
      attribution: mapboxToken ? '&copy; Mapbox &copy; OpenStreetMap' : '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
      tileSize: mapboxToken ? 512 : 256,
      zoomOffset: mapboxToken ? -1 : 0,
    }).addTo(map);

    // Custom Icon Generators
    const createCustomIcon = (bgColor: string, iconHtml: string, size = 36) => {
      return LInstance.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${bgColor};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2.5px solid white;
            font-size: 16px;
          ">
            ${iconHtml}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    const donorIcon = createCustomIcon('#059669', '🍲', 38);
    const shelterIcon = createCustomIcon('#2563eb', '🏠', 38);
    const driverIcon = createCustomIcon('#047857', '🚚', 40);

    // Render Donors
    donations.forEach((d) => {
      if (d.donorCoords) {
        const marker = LInstance.marker(d.donorCoords, { icon: donorIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #059669; font-size: 14px;">Donor: ${d.donorName}</strong><br/>
            <span>Food: ${d.foodName} (${d.quantity})</span><br/>
            <span style="font-size: 12px; color: #64748b;">Deadline: ${new Date(d.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        `);
      }
    });

    const isSelfDrive = mode === 'NGO_DESTINATION' || activeDonation?.deliveryMode === 'SELF_DRIVE';
    const isDriverApproach = mode === 'DRIVER_APPROACH' || (activeDonation?.deliveryMode === 'VOLUNTEER' && activeDonation.assignedDriver);

    // Render Shelters (always if NGO_DESTINATION or general)
    shelters.forEach((s) => {
      const marker = LInstance.marker(s.coords, { icon: shelterIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #2563eb; font-size: 14px;">Destination Shelter: ${s.name}</strong><br/>
          <span>Address: ${s.address}</span><br/>
          <span>Cap: ${s.capacityMeals} meals</span><br/>
          <span style="color: #059669; font-weight: bold;">Drop-off Receiving Open</span>
        </div>
      `);
      if (isSelfDrive) {
        marker.openPopup();
      }
    });

    // Render Drivers (only if not self-drive)
    if (!isSelfDrive) {
      drivers.forEach((drv) => {
        const marker = LInstance.marker(drv.coords, { icon: driverIcon }).addTo(map);
        driverMarkerRef.current = marker;
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #047857; font-size: 14px;">Approaching Courier: ${drv.name}</strong><br/>
            <span>Vehicle: ${drv.vehicleType}</span><br/>
            <span style="color: #d97706; font-weight: bold;">ETA to Donor: ${drv.etaToDonorMinutes} mins</span>
          </div>
        `);
        if (isDriverApproach) {
          marker.openPopup();
        }
      });
    }

    // Dynamic Polyline Route Drawing
    if (activeDonation && activeDonation.donorCoords) {
      if (activeDonation.matchedShelter) {
        if (isSelfDrive || !activeDonation.assignedDriver) {
          // Direct route from Donor Restaurant to Matched Shelter
          const latlngs = [activeDonation.donorCoords, activeDonation.matchedShelter.coords];
          const polyline = LInstance.polyline(latlngs, {
            color: '#2563eb',
            weight: 5,
            dashArray: '8, 8',
            lineCap: 'round',
          }).addTo(map);
          polylineRef.current = polyline;
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        } else {
          // Full courier dispatch route: Driver -> Donor Restaurant -> Matched Shelter
          const latlngs = [
            activeDonation.assignedDriver.coords,
            activeDonation.donorCoords,
            activeDonation.matchedShelter.coords,
          ];
          const polyline = LInstance.polyline(latlngs, {
            color: '#059669',
            weight: 4,
            dashArray: '8, 8',
            lineCap: 'round',
          }).addTo(map);
          polylineRef.current = polyline;
          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        }
      } else {
        // No shelter matched yet: fit bounds on restaurant and visible candidate shelters
        const allPoints: [number, number][] = [activeDonation.donorCoords];
        shelters.forEach((s) => {
          if (s.coords) allPoints.push(s.coords);
        });
        if (allPoints.length > 1) {
          map.fitBounds(LInstance.latLngBounds(allPoints), { padding: [50, 50], maxZoom: 14 });
        } else {
          map.setView(activeDonation.donorCoords, 14);
        }
      }
    } else if (shelters.length > 0) {
      const shelterPoints = shelters.map((s) => s.coords);
      map.fitBounds(LInstance.latLngBounds(shelterPoints), { padding: [50, 50], maxZoom: 14 });
    }

    return () => {
      map.remove();
    };
  }, [mounted, LInstance, donations, shelters, drivers, activeDonationId, mode]);

  // Real-Time Driver Movement & Location Stream Subscription
  useEffect(() => {
    const unsub = realtimeEngine.subscribe('DRIVER_LOCATION_UPDATE', (evt) => {
      const p = evt.payload;
      if (!p || !p.coords || !Array.isArray(p.coords)) return;
      setLiveTelemetry(p);

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(p.coords);
      }

      const activeDonation = donations.find((d) => d.id === activeDonationId) || donations[0];
      if (polylineRef.current && activeDonation?.donorCoords && activeDonation?.matchedShelter?.coords) {
        polylineRef.current.setLatLngs([
          p.coords,
          activeDonation.donorCoords,
          activeDonation.matchedShelter.coords,
        ]);
      }
    });

    return () => {
      unsub();
    };
  }, [activeDonationId, donations]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-medium">
        Loading Rescue Map Engine...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
      <div id="replate-leaflet-map" style={{ height: height, width: '100%' }} />
      {/* Map Live Radar Overlay */}
      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 shadow-md z-[500]">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="font-extrabold tracking-wider text-[11px]">LIVE RESCUE RADAR</span>
        {liveTelemetry && (
          <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 pl-2 border-l border-slate-300 dark:border-slate-600 flex items-center gap-2">
            <span>⚡ {liveTelemetry.speed || 34} km/h</span>
            <span>⏱ ~{liveTelemetry.etaMinutes || 6} min ETA</span>
          </span>
        )}
      </div>
    </div>
  );
}
