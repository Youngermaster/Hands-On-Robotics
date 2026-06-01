# Wire protocol — sanity table

Quick mental-check table for `mixDifferentialDrive` + `formatFrame`. Test
infrastructure isn't wired up in this app yet (no Jest); revisit when we
ship Module 08.

| (x, y)        | left | right | formatted     |
| ------------- | ---- | ----- | ------------- |
| (0, 1)        | 255  | 255   | `255,255\n`   |
| (0, -1)       | -255 | -255  | `-255,-255\n` |
| (-1, 0)       | -255 | 255   | `-255,255\n`  |
| (1, 0)        | 255  | -255  | `255,-255\n`  |
| (0, 0.5)      | 128  | 128   | `128,128\n`   |
| (1, 1)        | 255  | 0     | `255,0\n`     |  ← scaled so peak=1
| (-1, 1)       | 0    | 255   | `0,255\n`     |  ← spin while moving forward
