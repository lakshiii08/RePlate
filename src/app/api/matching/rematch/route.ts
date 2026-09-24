import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const { donationId, reason } = await request.json();
    const dIdx = globalServerStore.donations.findIndex((d) => d.id.toLowerCase() === donationId?.toLowerCase());
    if (dIdx === -1) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const backupDriver =
      globalServerStore.drivers.find(
        (d) => d.status === 'AVAILABLE' && d.id !== globalServerStore.donations[dIdx].assignedDriver?.id
      ) || globalServerStore.drivers[1];
    const backupShelter = globalServerStore.shelters[1];

    globalServerStore.donations[dIdx] = {
      ...globalServerStore.donations[dIdx],
      status: 'RE_MATCHING',
      assignedDriver: backupDriver,
      matchedShelter: backupShelter,
      driverCoords: backupDriver.coords,
      urgencyLevel: 'critical',
    };

    return NextResponse.json({
      donation: globalServerStore.donations[dIdx],
      backupDriver,
      backupShelter,
      reason: reason || 'Dynamic rematch executed',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to trigger rematch' }, { status: 500 });
  }
}
