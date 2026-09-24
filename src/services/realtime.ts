/**
 * WebSocket/Socket.IO-ready realtime architecture for RePlate.
 * Connects to ws://localhost:8000 when active, with simulated event emitter fallback.
 */

type EventCallback = (event: { type: string; payload: any }) => void;

class RealtimeEngine {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private ws: WebSocket | null = null;
  private wsUrl: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
  private connected: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false') {
      this.initWebSocket();
    }
  }

  private initWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        this.connected = true;
        console.log('[WebSocket]: Connected to RePlate Realtime Engine');
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emitLocal(data.type, data.payload);
        } catch (e) {
          console.error('[WebSocket Error]:', e);
        }
      };
      this.ws.onclose = () => {
        this.connected = false;
        console.log('[WebSocket]: Disconnected from server');
      };
    } catch {
      console.log('[WebSocket]: Running in Simulated Offline Mode');
    }
  }

  public subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public emitLocal(eventType: string, payload: any) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => cb({ type: eventType, payload }));
    }
  }

  public isConnected(): boolean {
    return this.connected || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  }
}

export const realtimeEngine = new RealtimeEngine();
