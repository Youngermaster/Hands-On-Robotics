# Why an H-bridge, and how the L298N works

An ESP32 GPIO can sink ~12 mA at 3.3 V. A DC gear motor draws 200–1000 mA
at 5–12 V. So you can't wire a motor directly to a GPIO — the chip would
burn out instantly and there's not enough voltage to spin the motor anyway.

The fix is an **H-bridge**: four transistors arranged so the logic
signals choose which way current flows through the motor. The L298N is a
classic dual H-bridge IC packaged on a hobby breakout.

## Per motor: 3 control pins

| Pin   | Role                                                                  |
| ----- | --------------------------------------------------------------------- |
| `EN`  | enables the H-bridge for that motor; **PWM here for speed control**   |
| `IN1` | direction bit A                                                       |
| `IN2` | direction bit B                                                       |

| IN1 | IN2 | EN     | Motor state |
| --- | --- | ------ | ----------- |
| 0   | 0   | x      | brake (coast on the L298N variant) |
| 1   | 0   | PWM    | forward, speed ∝ PWM duty |
| 0   | 1   | PWM    | reverse, speed ∝ PWM duty |
| 1   | 1   | x      | brake (both terminals tied) |

Per-motor decoder in firmware:

```cpp
if (speed > 0)      { digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); }
else if (speed < 0) { digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH); }
else                { digitalWrite(IN1, LOW);  digitalWrite(IN2, LOW); } // coast
ledcWrite(channel, abs(speed));   // 0..255
```

## PWM on the ESP32 (`ledc`)

The ESP32 has 16 hardware PWM channels grouped into 2 timer banks. We
allocate one channel per motor:

```cpp
const int PWMFreq        = 1000;   // 1 kHz — inaudible on these motors
const int PWMResolution  = 8;      // 8 bits = 0..255 duty
const int rightChannel   = 4;
const int leftChannel    = 5;

ledcSetup(rightChannel, PWMFreq, PWMResolution);
ledcSetup(leftChannel,  PWMFreq, PWMResolution);
ledcAttachPin(ENA_PIN,  rightChannel);
ledcAttachPin(ENB_PIN,  leftChannel);

ledcWrite(rightChannel, 200);      // ~78 % duty cycle
```

Picking 1 kHz: low enough to be efficient (less switching loss in the
H-bridge), high enough to be above human hearing for most motors.

## Differential drive mixing

The car is **non-holonomic**: it can't strafe sideways. Forward/reverse +
turning is achieved by spinning the two wheels at different speeds. With
a 2-axis joystick `(x, y)` where:

- `y ∈ [-1, +1]` is throttle (forward+)
- `x ∈ [-1, +1]` is steering (right+)

the per-wheel command is:

```text
left  = (y + x) * MAX
right = (y - x) * MAX
```

Saturation: if either result falls outside `[-MAX, +MAX]`, scale both
equally so the *ratio* is preserved. Without that, hard turns at full
throttle clip and the car under-rotates. (Both firmwares in this module
do the mixing in the *app*, not the firmware, so the protocol stays
`(left, right)` and either side can be swapped.)

## Pin choices on the ESP32

| ESP32 GPIO | Why this pin                                                       |
| ---------- | ------------------------------------------------------------------ |
| 22, 23     | safe output pins, no strapping role                                |
| 16, 17     | available on WROOM-32D (used for PSRAM on some WROVER variants — fine here) |
| 18, 19     | spare digital pins                                                  |

Pins **avoided**: GPIO 0/2/12/15 (strapping pins — drive them at boot
and the chip enters an odd mode); GPIO 6–11 (wired to flash); GPIO 34–39
(input-only).

## See also

- L298N datasheet: https://www.st.com/resource/en/datasheet/l298.pdf
- ESP32 `ledc` API: https://docs.espressif.com/projects/esp-idf/en/v5.1.4/esp32/api-reference/peripherals/ledc.html
