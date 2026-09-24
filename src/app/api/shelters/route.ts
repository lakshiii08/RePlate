import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function GET() {
  return NextResponse.json(globalServerStore.shelters);
}
