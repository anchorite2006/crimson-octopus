# Crimson Octopus, Impossible Escape

A vivid crimson octopus bursts out of a small glass bottle resting on a coral reef, its eight tentacles unfurling in every direction like a genie rising from a lamp, eyes locked straight on the viewer. Nothing that large should ever have fit inside such a tiny vessel, and that impossible escape is the whole thrill of the piece. The artwork is a 1024x1024 JPEG.

[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/anchorite2006/crimson-octopus/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/anchorite2006/crimson-octopus/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

## How to run

```sh
node main.ts
```

This copies `entry.png` to the directory named by the `MAKEFUN_OUTPUT_DIR` environment variable, or to `/output` when that variable is not set. The copy is atomic: the bytes are first written to a temporary file in the same output directory and then renamed into place as `entry.png`, so a reader never sees a partially written file.
