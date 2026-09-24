import { NextResponse } from 'next/server';
import { adminDataService } from '@/services/adminData';

export async function GET() {
  return NextResponse.json(adminDataService.getMonthlySavings());
}
