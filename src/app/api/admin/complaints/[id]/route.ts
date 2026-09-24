import { NextResponse } from 'next/server';
import { adminDataService } from '@/services/adminData';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, resolutionNotes } = await request.json();

  const updated = adminDataService.updateComplaintStatus(id, status, resolutionNotes);
  if (!updated) {
    return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
