# Project 02 — Wi-Fi WebSocket Control

The ESP32 connects to your Wi-Fi network and **hosts** a WebSocket
server on port 81. Your phone connects directly to the ESP32's IP and
sends the same `"<left>,<right>"` text frames as the BLE project.

No external machine in the loop — the ESP32 IS the server. Lower
latency, simpler deployment than a relay architecture.

## Why the ESP32 is the server (not a relay)

| Architecture                       | Latency | Setup cost                | When to use                         |
| ---------------------------------- | ------- | ------------------------- | ----------------------------------- |
| **ESP32 = server** (this project)  | ~30 ms  | none beyond Wi-Fi creds   | LAN robot control                   |
| Laptop/cloud relay (Module 05 pattern) | 100+ ms (over LAN) | laptop must stay on | Telemetry fan-out, remote teleop, fleet |

For driving a car next to you, the direct path wins. The relay pattern
shows up in Module 12+ when ROS2 enters the picture.

## Identifiers

| Thing               | Value                                          |
| ------------------- | ---------------------------------------------- |
| WebSocket URL       | `ws://<esp32-ip>:81/`                          |
| Protocol            | text frames, UTF-8                             |
| Frame format        | `"<left>,<right>\n"`                           |

## Files

```text
projects/02-wifi-websocket-control/
├── README.md
└── platforms/
    └── esp32/
        ├── platformio.ini
        ├── src/
        │   ├── main.cpp
        │   └── secrets.h.example
        ├── scripts/flash.sh
        └── README.md
```

## Run

```bash
cd modules/07-robot-car/projects/02-wifi-websocket-control/platforms/esp32
cp src/secrets.h.example src/secrets.h
# Edit: WIFI_SSID, WIFI_PASSWORD
pio run --target upload
pio device monitor
```

You'll see:

```text
[wifi] connecting to MyWifi.....
[wifi] connected, ip=192.168.1.123
[ws] server listening on :81
```

Then in the app: Drive tab → Mode: **Wi-Fi** → enter `192.168.1.123:81` → Connect.

## Testing without the app

Any WebSocket client works. With `websocat`:

```bash
brew install websocat        # macOS
websocat ws://192.168.1.123:81/
# type and press Enter:
255,255
0,0
-128,128
```

## Watchdog & disconnect handling

- 500 ms inactivity → motors zeroed (same as BLE).
- Phone closes the WebSocket cleanly → ESP32 logs `[ws] client #0 disconnected` and motors zero immediately.
- Phone walks out of range → TCP keepalive eventually drops the connection (~30 s by default); the watchdog kicks in well before.
