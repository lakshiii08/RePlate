import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/backendProxy';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(req, `/rescues/${id}`);
}
