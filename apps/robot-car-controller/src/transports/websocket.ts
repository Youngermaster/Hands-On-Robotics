// WebSocket transport. The ESP32 (Module 07 / project 02) hosts the server
// on port 81 by default. URL form: ws://192.168.x.x:81/.

import { formatFrame } from '@/protocol/drive';

import type { Transport, TransportStatus } from './types';

export class WebSocketTransport implements Transport {
  private ws: WebSocket | null = null;
  private status: TransportStatus = { state: 'disconnected' };
  private listeners = new Set<(s: TransportStatus) => void>();

  constructor(private readonly url: string) {}

  getStatus(): TransportStatus {
    return this.status;
  }

  subscribe(listener: (s: TransportStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  async connect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus({ state: 'connecting', detail: this.url });

    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        this.setStatus({ state: 'connected', detail: this.url });
        resolve();
      };
      ws.onerror = (e) => {
        const message = (e as { message?: string }).message ?? 'WebSocket error';
        this.setStatus({ state: 'error', error: message, detail: this.url });
        reject(new Error(message));
      };
      ws.onclose = () => {
        // Only transition if we weren't already in `error`.
        if (this.status.state !== 'error') {
          this.setStatus({ state: 'disconnected' });
        }
        this.ws = null;
      };
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus({ state: 'disconnected' });
  }

  send(left: number, right: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(formatFrame(left, right));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.setStatus({ state: 'error', error: message });
    }
  }

  private setStatus(next: TransportStatus): void {
    this.status = next;
    for (const l of this.listeners) l(next);
  }
}
