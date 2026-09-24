import { NextResponse } from 'next/server';
import { getImpactMetrics } from '@/lib/serverStore';

export async function GET() {
  return NextResponse.json(getImpactMetrics());
}
