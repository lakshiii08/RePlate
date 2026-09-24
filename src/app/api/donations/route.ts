import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';
import { Donation } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const donorId = searchParams.get('donorId');
  const urgency = searchParams.get('urgency');

  let results = [...globalServerStore.donations];
  if (status) {
    results = results.filter((d) => d.status.toLowerCase() === status.toLowerCase());
  }
  if (donorId) {
    results = results.filter((d) => d.donorId === donorId);
  }
  if (urgency) {
    results = results.filter((d) => d.urgencyLevel === urgency);
  }

  return NextResponse.json(results);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const rescueWindowMinutes = data.rescueWindowMinutes || 90;

    const newDonation: Donation = {
      ...data,
      id: `RP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'POSTED',
      createdAt: new Date().toISOString(),
      pickupDeadline:
        data.pickupDeadline || new Date(Date.now() + rescueWindowMinutes * 60000).toISOString(),
      urgencyLevel:
        rescueWindowMinutes < 30 ? 'critical' : rescueWindowMinutes < 60 ? 'attention' : 'normal',
    };

    globalServerStore.donations.unshift(newDonation);
    return NextResponse.json(newDonation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 400 });
  }
}
