# Project 01 firmware — ESP32

Sends one JSON POST every 5 seconds to the Axum server.

## Setup

```bash
cp src/secrets.h.example src/secrets.h
# Edit src/secrets.h:
#   WIFI_SSID      — your 2.4 GHz network
#   WIFI_PASSWORD
#   SERVER_URL     — http://<laptop-ip>:8080/telemetry
pio run --target upload
pio device monitor   # 115200 baud
```

## Wiring

None required. The onboard LED (GPIO 2) blinks briefly on each
successful POST.

## What the JSON looks like

```json
{
  "chip": "ESP32-D0WD-V3",
  "rev": 3,
  "cores": 2,
  "freq_mhz": 240,
  "uptime_ms": 12345,
  "rssi": -47
}
```

## How it works

1. `wait_for_wifi()` blocks until `WiFi.status() == WL_CONNECTED`.
2. `loop()` posts every 5 s. If Wi-Fi drops mid-run, we reconnect on the
   next iteration before retrying.
3. `StaticJsonDocument<256>` keeps the JSON document on the stack — no
   heap fragmentation. 256 B is plenty for these fields.
4. The onboard LED flashes for 40 ms on each `2xx` response, so you have
   a visual heartbeat even if you don't have the server log open.

## Troubleshooting

- **`http.begin failed`**: malformed `SERVER_URL`. Must include scheme
  and port: `http://192.168.1.42:8080/telemetry`.
- **`POST … -> -1` or `-11`**: server isn't reachable. Test from your
  laptop with `curl -v http://localhost:8080/telemetry -d '{}' -H 'content-type: application/json'`.
- **`POST … -> -1` and the laptop CAN curl itself**: laptop firewall is
  blocking inbound 8080. Allow the binary in System Settings on macOS.
