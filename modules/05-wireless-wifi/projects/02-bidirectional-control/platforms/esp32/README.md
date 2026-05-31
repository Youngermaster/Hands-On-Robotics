# Project 02 firmware — ESP32

Bidirectional: pressing the button posts an event, and the firmware polls
the server every 500 ms to find out whether the onboard LED should be on
or off.

## Setup

```bash
cp src/secrets.h.example src/secrets.h
# Edit src/secrets.h:
#   WIFI_SSID
#   WIFI_PASSWORD
#   SERVER_BASE_URL   — http://<laptop-ip>:8080  (no trailing slash)
pio run --target upload
pio device monitor
```

## Wiring

Same as Module 01 ESP32:

- Button: GPIO 4 → button → GND (internal pull-up).
- LED: GPIO 2 → 220 Ω → LED → GND. (Onboard LED on GPIO 2 also works
  without the external LED.)

## How it works

1. `attachInterrupt(... FALLING)` fires `on_button_press()` on each
   press; the ISR debounces in 30 ms and sets `g_press_pending`.
2. `loop()` runs twice per second:
   - If a press is pending, POST to `/events`.
   - Always GET `/led` and apply the result to the LED. We only drive
     the GPIO when the desired state actually changes — keeps the serial
     monitor clean.
3. Wi-Fi drops auto-reconnect at the top of `loop()`.

## Latency budget

| Step                | Time      |
| ------------------- | --------- |
| `curl` reaches Axum | <5 ms LAN |
| Axum sets state     | <1 ms     |
| ESP32 next poll     | 0–500 ms  |
| `digitalWrite`      | <1 µs     |

So average end-to-end latency is ~250 ms, worst case ~500 ms. Drop
`kPollPeriodMs` if you need it tighter, or switch to WebSockets / SSE
later (a future module).

## Why polling, not WebSockets?

For a learning project, polling is the right introduction:

- Three function calls (`http.GET`, `getString`, `deserializeJson`).
- No persistent connection to manage.
- Same mental model as Project 01's POST.

WebSockets cut latency to single-digit milliseconds but add ~100 lines of
state-machine code. We'll get there in module 09 or so.
