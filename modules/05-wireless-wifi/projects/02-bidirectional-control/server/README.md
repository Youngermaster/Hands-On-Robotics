# Project 02 server — Axum (Rust)

Bidirectional. Holds two pieces of state in memory:

- **Desired LED state** (`bool`) — what the ESP32 should be doing.
- **Event log** (`VecDeque<StoredEvent>`, capped at 200) — what the ESP32 has done.

## Run

```bash
cargo run --release
# Listening on http://0.0.0.0:8080

BIND_ADDR=0.0.0.0:9000 cargo run --release   # custom port
```

Or:

```bash
./scripts/run.sh
```

## Endpoints

| Method | Path        | Body                                                        | Response                   |
| ------ | ----------- | ----------------------------------------------------------- | -------------------------- |
| GET    | `/`         | —                                                           | HTML control panel         |
| GET    | `/events`   | —                                                           | JSON `[…]`                 |
| POST   | `/events`   | `{"event":"button_pressed","uptime_ms":12345}`              | `204 No Content`           |
| GET    | `/led`      | —                                                           | `{"on": bool}`             |
| POST   | `/led`      | `{"on": bool}`                                              | `{"on": bool}`             |
| POST   | `/led/form` | `on=true` (form, used by the HTML button)                   | `303 See Other` → `/`      |

## Smoke test (without the ESP32)

```bash
# Set the LED state
curl -X POST http://127.0.0.1:8080/led \
     -H 'content-type: application/json' \
     -d '{"on":true}'

# Read it back (what the ESP32 polls)
curl http://127.0.0.1:8080/led
# → {"on":true}

# Push an event manually
curl -X POST http://127.0.0.1:8080/events \
     -H 'content-type: application/json' \
     -d '{"event":"manual","uptime_ms":1}'

# Inspect the log
curl http://127.0.0.1:8080/events
```

Open `http://127.0.0.1:8080/` in a browser — the page has Turn ON / Turn
OFF buttons that POST to `/led/form` and redirect back, so non-technical
users can drive the LED without curl.

## Design notes

- **One shared mutex per piece of state**, not one big mutex. Lets the
  GET `/led` (called every 500 ms by the ESP32) not block on the events
  list.
- Two `/led` POST routes (`application/json` for the firmware/curl,
  `application/x-www-form-urlencoded` for the HTML form) because we
  want `POST /led` to stay strict JSON for machine clients. The HTML
  button hits `/led/form` and redirects.
- `parking_lot::Mutex` because we never hold the lock across `.await`.
- `tracing` + `TraceLayer` give per-request logs.
- Graceful shutdown on Ctrl-C.

## Optional next step: long-polling

Right now the ESP32 polls every 500 ms. To cut latency, change `GET /led`
to **long-poll**: hold the connection open until the state changes (with
a 30 s timeout). It's ~15 lines of `tokio::sync::Notify`. Good Module 06
warm-up.
