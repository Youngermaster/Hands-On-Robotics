// Shared interface implemented by both transports.
//
// Both transports own their connection state and expose a `send(left, right)`
// method that the Drive screen calls at ~20 Hz. The transport itself is
// responsible for whatever framing the wire needs (text for WS, raw bytes for
// BLE write-without-response).

export type TransportState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface TransportStatus {
  state: TransportState;
  error?: string;
  /** Optional human label for the UI (IP, device name, MAC). */
  detail?: string;
}

export interface Transport {
  getStatus(): TransportStatus;
  subscribe(listener: (s: TransportStatus) => void): () => void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(left: number, right: number): void;
}
