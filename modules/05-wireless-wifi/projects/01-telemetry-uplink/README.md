# Project 01 — Telemetry Uplink

**Pattern:** fire-and-forget. The ESP32 connects to Wi-Fi and POSTs a
JSON heartbeat to the server every 5 seconds. The server records the
last N entries and serves a simple HTML index.

Smallest possible "device → cloud" loop. Useful as the starting point
for sensor logging.

## What the ESP32 sends

```json
{
  "chip":      "ESP32-D0WD-V3",
  "rev":       3,
  "cores":     2,
  "freq_mhz":  240,
  "uptime_ms": 12345,
  "rssi":      -47
}
```

POSTed to `POST /telemetry` as `application/json`. The server responds
with `204 No Content` (or `400` if the JSON is malformed).

## Files

```text
projects/01-telemetry-uplink/
├── README.md             ← this file
├── platforms/
│   └── esp32/            ← firmware
│       ├── platformio.ini
│       ├── src/
│       │   ├── main.cpp
│       │   └── secrets.h.example  (copy to secrets.h, fill in)
│       ├── scripts/flash.sh
│       └── README.md
└── server/               ← Rust Axum (cargo workspace member)
    ├── Cargo.toml
    ├── src/main.rs
    ├── scripts/run.sh
    └── README.md
```

## Run

In one shell:

```bash
cd modules/05-wireless-wifi/projects/01-telemetry-uplink/server
cargo run --release
# Listening on http://0.0.0.0:8080
```

Find your laptop's LAN IP (macOS: `ipconfig getifaddr en0`; Linux: `hostname -I`).

In another shell, prep the firmware:

```bash
cd modules/05-wireless-wifi/projects/01-telemetry-uplink/platforms/esp32
cp src/secrets.h.example src/secrets.h
# Edit secrets.h: WIFI_SSID, WIFI_PASSWORD, SERVER_URL (e.g. http://192.168.1.42:8080/telemetry)
pio run --target upload
pio device monitor
```

Open `http://<laptop-ip>:8080/` in a browser. Within ~5 s of the ESP32
booting, you should see the first telemetry row appear.

## What to look for

In the ESP32 serial monitor:

```text
[wifi] connecting to MyWiFi...
[wifi] connected, ip=192.168.1.123 rssi=-47
[uplink] POST http://192.168.1.42:8080/telemetry -> 204
[uplink] POST http://192.168.1.42:8080/telemetry -> 204
```

In the Axum server log:

```text
2026-05-30T13:04:12 INFO server: bound 0.0.0.0:8080
2026-05-30T13:04:18 INFO server: telemetry from ESP32-D0WD-V3 rssi=-47 uptime=4123ms
```

## Why this is the right starting pattern

- **No server state for the device.** If the ESP32 misses a beat, nothing
  in its firmware breaks. Retry on the next loop iteration.
- **No reachability requirement on the device side.** The ESP32 doesn't
  need to be reachable from the server, only the other way around. Works
  through NAT, behind home routers, etc.
- **Identical to how real IoT fleets work** — devices push, the server
  ingests. The next project (02-bidirectional) shows how to add the
  reverse channel.
