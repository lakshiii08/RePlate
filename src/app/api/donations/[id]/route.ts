import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const found = globalServerStore.donations.find((d) => d.id.toLowerCase() === id.toLowerCase());
  if (!found) {
    return NextResponse.json({ error: 'Donation not found', fallback: globalServerStore.donations[0] }, { status: 404 });
  }
  return NextResponse.json(found);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();

  const idx = globalServerStore.donations.findIndex((d) => d.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
  }

  globalServerStore.donations[idx] = {
    ...globalServerStore.donations[idx],
    ...updates,
  };

  return NextResponse.json(globalServerStore.donations[idx]);
}
