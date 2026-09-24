import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const { donationId, shelterId, driverId } = await request.json();
    const dIdx = globalServerStore.donations.findIndex((d) => d.id.toLowerCase() === donationId?.toLowerCase());
    if (dIdx === -1) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const shelter = globalServerStore.shelters.find((s) => s.id === shelterId) || globalServerStore.shelters[0];
    const driver = globalServerStore.drivers.find((dr) => dr.id === driverId) || globalServerStore.drivers[0];

    globalServerStore.donations[dIdx] = {
      ...globalServerStore.donations[dIdx],
      status: 'DRIVER_ASSIGNED',
      matchedShelter: shelter,
      assignedDriver: driver,
      driverCoords: driver.coords,
    };

    return NextResponse.json(globalServerStore.donations[dIdx]);
  } catch {
    return NextResponse.json({ error: 'Failed to assign' }, { status: 500 });
  }
}
