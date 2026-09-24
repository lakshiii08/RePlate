import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();
    let user = globalServerStore.users.find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase()
    );
    if (!user && role) {
      user = globalServerStore.users.find((u) => u.role === role);
    }
    if (!user) {
      user = globalServerStore.users[0];
    }
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Auth failed' }, { status: 400 });
  }
}
