# Project 01 server — Axum (Rust)

Ingests JSON heartbeats from the ESP32 firmware. Stores the last 200 in
memory. Serves an HTML view at `/` and JSON at `/telemetry`.

## Run

```bash
cargo run --release            # listens on 0.0.0.0:8080
BIND_ADDR=0.0.0.0:9000 cargo run --release   # custom port
```

Or:

```bash
./scripts/run.sh
```

## Endpoints

| Method | Path          | Body                       | Response             |
| ------ | ------------- | -------------------------- | -------------------- |
| GET    | `/`           | —                          | HTML index           |
| GET    | `/telemetry`  | —                          | JSON `[…]` history   |
| POST   | `/telemetry`  | JSON `{chip,rev,…,rssi}`   | `204 No Content`     |

## Smoke test (without the ESP32)

```bash
curl -X POST http://127.0.0.1:8080/telemetry \
  -H 'content-type: application/json' \
  -d '{"chip":"manual","uptime_ms":1,"rssi":-30}'
curl http://127.0.0.1:8080/telemetry
```

Refresh `http://127.0.0.1:8080/` — the row should be there.

## Design notes

- **In-memory ring buffer** (`VecDeque` capped at 200). No database
  intentionally — this is a learning artifact, not infra.
- **`parking_lot::Mutex`** rather than `tokio::sync::Mutex` because we
  never hold the lock across an `.await`. Cheaper, no fairness pitfalls.
- **All `Telemetry` fields optional** so the server keeps accepting
  payloads while you iterate on the firmware schema. Production code
  would tighten this.
- **Graceful shutdown on Ctrl-C** via `axum::serve(...).with_graceful_shutdown(...)`.

## Why Rust + Axum for this?

It is enough lines of code to demonstrate every concept a real server
needs (routing, shared state, JSON in/out, structured logging, graceful
shutdown) — but small enough to read in one sitting. Compiles to a
single static binary, easy to scp onto an SBC if you want to host it
elsewhere.
