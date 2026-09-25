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
  private reconnectTimer: any = null;

  private pingTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWebSocket();
    }
  }

  public initWebSocket() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        console.log('⚡ [Realtime Telemetry]: Connected to live WebSocket stream at', this.wsUrl);
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        // Start 20s heartbeat ping
        if (this.pingTimer) clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
          }
        }, 20000);

        this.emitLocal('CONNECTED', { status: 'ONLINE', timestamp: new Date().toISOString() });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PONG') return; // Heartbeat response
          this.emitLocal(data.type, data.payload);
        } catch (e) {
          console.error('[Realtime message parse error]:', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        if (this.pingTimer) {
          clearInterval(this.pingTimer);
          this.pingTimer = null;
        }
        this.emitLocal('DISCONNECTED', { status: 'OFFLINE', timestamp: new Date().toISOString() });
        console.log('⚡ [Realtime Telemetry]: Disconnected. Reconnecting in 2.5s...');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('⚡ [Realtime Telemetry]: Connection error, closing socket for reconnect.');
        this.ws?.close();
      };
    } catch (e) {
      console.warn('⚡ [Realtime Telemetry]: WebSocket init failed, retrying in 3s...');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.initWebSocket();
    }, 2500);
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
      callbacks.forEach((cb) => {
        try {
          cb({ type: eventType, payload });
        } catch (err) {
          console.error('[Realtime Listener Error]:', err);
        }
      });
    }
  }

  public send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
    // Also dispatch locally for instantaneous UI feedback
    this.emitLocal(type, payload);
  }

  public async broadcastDriverLocation(params: {
    driverId: string;
    coords: [number, number];
    activeDonationId?: string;
    speed?: number;
    heading?: number;
    etaMinutes?: number;
  }) {
    // 1. Send via WebSocket for instant sub-millisecond broadcast
    this.send('DRIVER_LOCATION_UPDATE', {
      ...params,
      timestamp: new Date().toISOString(),
    });

    // 2. Persist to backend database via REST endpoint
    try {
      const { apiClient } = await import('./apiClient');
      await apiClient.post(`/drivers/${params.driverId}/location`, params);
    } catch (e) {
      // Non-blocking
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }
}

export const realtimeEngine = new RealtimeEngine();
