# Project 02 firmware — ESP32 Wi-Fi WebSocket car

Same pin map as the BLE project (so wiring is identical):

| Pin    | Role                |
| ------ | ------------------- |
| GPIO 22 | L298N ENA (right PWM) |
| GPIO 16 | L298N IN1            |
| GPIO 17 | L298N IN2            |
| GPIO 23 | L298N ENB (left PWM) |
| GPIO 18 | L298N IN3            |
| GPIO 19 | L298N IN4            |

## Build & run

```bash
cp src/secrets.h.example src/secrets.h     # fill in WIFI_SSID + WIFI_PASSWORD
pio run --target upload
pio device monitor
```

Successful boot:

```text
[boot] hands-on-robotics m07/02 wifi-websocket-control
[wifi] connecting to MyWifi.....
[wifi] connected, ip=192.168.1.123
[ws] server listening on :81
```

Note the IP — you'll plug it into the app's Settings tab.

## How it works

- `WebSocketsServer` (Markus Sattler's library, `links2004/WebSockets`) hosts the server.
- All four interesting events are handled in `on_ws_event`:
  - `WStype_CONNECTED` — log the client IP.
  - `WStype_DISCONNECTED` — immediately zero motors (don't wait for the 500 ms watchdog).
  - `WStype_TEXT` — parse the frame.
  - `WStype_ERROR` — log.
- `loop()` calls `g_ws.loop()` every tick to service the TCP socket, then applies the watchdog and writes the motors.

## Trade-offs vs the BLE variant

| Aspect            | BLE                          | Wi-Fi WS                              |
| ----------------- | ---------------------------- | ------------------------------------- |
| Pairing required? | yes (one-shot)               | no, but you need the IP               |
| Range             | ~10 m line-of-sight          | as far as Wi-Fi reaches (~30 m+)      |
| Latency           | 30–80 ms                     | 10–40 ms on a quiet 2.4 GHz network   |
| Works on Expo Go? | no (requires dev client)     | **yes** (built-in WebSocket)          |
| Battery (radio)   | lower                        | higher                                |

If you're just starting, run this one first — it works with Expo Go out
of the box and the IP is easier to debug than UUIDs.
