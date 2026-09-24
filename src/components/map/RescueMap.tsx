'use client';

import React, { useEffect, useState } from 'react';
import { Donation, Shelter, Driver } from '@/types';
import 'leaflet/dist/leaflet.css';

interface RescueMapProps {
  donations?: Donation[];
  shelters?: Shelter[];
  drivers?: Driver[];
  activeDonationId?: string;
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
  zoom = 13,
  center = [37.7749, -122.4194],
  height = '100%',
  interactive = true,
}: RescueMapProps) {
  const [mounted, setMounted] = useState(false);
  const [LInstance, setLInstance] = useState<any>(null);
  const [mapObj, setMapObj] = useState<any>(null);

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

    const map = LInstance.map('replate-leaflet-map', {
      center: center,
      zoom: zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
    });

    setMapObj(map);

    // OpenStreetMap dark/light tiled background
    LInstance.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
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

    // Render Shelters
    shelters.forEach((s) => {
      const marker = LInstance.marker(s.coords, { icon: shelterIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #2563eb; font-size: 14px;">Shelter: ${s.name}</strong><br/>
          <span>Cap: ${s.capacityMeals} meals</span><br/>
          <span>Needs: ${s.currentNeeds.join(', ')}</span>
        </div>
      `);
    });

    // Render Drivers
    drivers.forEach((drv) => {
      const marker = LInstance.marker(drv.coords, { icon: driverIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #047857; font-size: 14px;">Driver: ${drv.name}</strong><br/>
          <span>Vehicle: ${drv.vehicleType}</span><br/>
          <span>ETA: ${drv.etaToDonorMinutes} mins to pickup</span>
        </div>
      `);
    });

    // Draw active route line if donation has donor, driver, shelter
    const activeDonation = donations.find((d) => d.id === activeDonationId) || donations[0];
    if (activeDonation && activeDonation.matchedShelter && activeDonation.assignedDriver) {
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

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    return () => {
      map.remove();
    };
  }, [mounted, LInstance, donations, shelters, drivers, activeDonationId]);

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
      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 shadow-sm z-[500]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        LIVE RESCUE RADAR
      </div>
    </div>
  );
}
