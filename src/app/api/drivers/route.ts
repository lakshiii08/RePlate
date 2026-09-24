import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let results = [...globalServerStore.drivers];
  if (status) {
    results = results.filter((d) => d.status.toLowerCase() === status.toLowerCase());
  }
  return NextResponse.json(results);
}
