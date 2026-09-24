import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';
import { User } from '@/types';

export async function POST(request: Request) {
  try {
    const { name, email, phone, role } = await request.json();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role: role || 'DONOR',
      organization: `${role || 'Donor'} Partner Org`,
    };
    globalServerStore.users.push(newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
  }
}
