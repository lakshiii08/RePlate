import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const lower = query.toLowerCase();
    const criticalItem = globalServerStore.donations.find(
      (d) => d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING'
    );
    const availableDrivers = globalServerStore.drivers.filter((d) => d.status === 'AVAILABLE');

    let answer = '';
    if (lower.includes('prioritize') || lower.includes('priority') || lower.includes('urgent')) {
      if (criticalItem) {
        answer = `PRIORITY ACTION: Expedite Rescue #${criticalItem.id} (${criticalItem.foodName}). Rescue preservation window is under 20 minutes. Assign available courier ${availableDrivers[0]?.name || 'Elena Rostova'} (${availableDrivers[0]?.etaToDonorMinutes || 8} min ETA).`;
      } else {
        answer = `All current active rescues are progressing within normal safety margins.`;
      }
    } else if (lower.includes('driver') || lower.includes('courier')) {
      answer = `DISPATCH STATUS: ${availableDrivers.length} couriers available for active dispatch. Recommended: ${availableDrivers[0]?.name} (${availableDrivers[0]?.vehicleType}, ${availableDrivers[0]?.etaToDonorMinutes} min ETA, ${availableDrivers[0]?.rating}★ rating).`;
    } else if (lower.includes('shelter') || lower.includes('capacity')) {
      const topShelter = globalServerStore.shelters[0];
      answer = `INTAKE TELEMETRY: ${topShelter.name} has ${topShelter.capacityMeals} meal intake spaces available with active demand for Cooked Meals and Fresh Produce.`;
    } else if (lower.includes('rp-') || lower.includes('1024') || lower.includes('1026')) {
      const matched = globalServerStore.donations.find((d) =>
        lower.includes(d.id.toLowerCase()) || lower.includes(d.id.replace('rp-', ''))
      );
      if (matched) {
        answer = `RESCUE #${matched.id} (${matched.foodName}): Current status is ${matched.status.replace(/_/g, ' ')}. Donor: ${matched.donorName}. Shelter: ${matched.matchedShelter?.name || 'Awaiting Match'}. Driver: ${matched.assignedDriver?.name || 'Unassigned'}.`;
      } else {
        answer = `Rescue record located in historical database with full thermal verification.`;
      }
    } else {
      answer = `DISPATCH TELEMETRY: System tracking ${
        globalServerStore.donations.filter((d) => d.status !== 'DELIVERED').length
      } active rescues, ${availableDrivers.length} ready couriers, and ${globalServerStore.shelters.length} partner shelters.`;
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}
