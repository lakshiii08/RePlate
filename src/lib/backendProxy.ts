import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000';

export async function proxyToBackend(req: NextRequest, targetPath: string) {
  try {
    const url = `${BACKEND_URL}${targetPath}`;
    const method = req.method;
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const authHeader = req.headers.get('authorization');
    if (authHeader) headers.set('authorization', authHeader);

    let body: any = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await req.text();
      } catch {
        body = undefined;
      }
    }

    const backendRes = await fetch(url, {
      method,
      headers,
      body: body ? body : undefined,
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error(`[Proxy Error] failed connecting to backend ${targetPath}:`, error.message);
    return NextResponse.json(
      { success: false, error: `Backend unavailable: ${error.message}` },
      { status: 502 }
    );
  }
}
