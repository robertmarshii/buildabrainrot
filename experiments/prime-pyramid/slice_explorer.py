#!/usr/bin/env python3
"""Three-layer slices of the prime pyramid (Investigation step, Exp. A).

For a centre layer n, render layers n-1, n, n+1 side by side with every
block classified into the three categories from the investigation doc:

  rejected            gcd(N, wheel) > 1  -> near-black
  composite survivor  coprime, composite -> dim blue
  prime               prime block        -> pink

The interesting comparison is dim blue vs pink: does any geometry
separate them once the wheel-sieve scaffold is controlled for?

Usage: python3 slice_explorer.py [centre layers ...]   (default 8 20 40 60 80 99)
"""

import os
import sys
from math import gcd

from prime_pyramid_law import blocks_before, sieve, write_png

HERE = os.path.dirname(os.path.abspath(__file__))
WHEEL = 210

REJECTED = (18, 18, 24)
SURVIVOR = (68, 68, 110)
PRIME = (255, 64, 129)
GAP = (10, 10, 14)


def classify(N, is_p):
    if is_p[N]:
        return PRIME
    return SURVIVOR if gcd(N, WHEEL) == 1 else REJECTED


def render_slice(centre, is_p, scale=6, gap=2):
    layers = [centre - 1, centre, centre + 1]
    wmax = max(layers)
    width = sum(layers) * scale + gap * scale * (len(layers) - 1)
    height = wmax * scale
    pixels = [[GAP] * width for _ in range(height)]
    x0 = 0
    for n in layers:
        base = blocks_before(n)
        for r in range(n):
            for c in range(n):
                col = classify(base + r * n + c + 1, is_p)
                for dy in range(scale):
                    row = pixels[r * scale + dy]
                    for dx in range(scale):
                        row[x0 + c * scale + dx] = col
        x0 += (n + gap) * scale
    path = os.path.join(HERE, "renders", f"slice_{centre:03d}.png")
    write_png(path, pixels)
    return path


def main():
    centres = [int(a) for a in sys.argv[1:]] or [8, 20, 40, 60, 80, 99]
    top = max(centres) + 1
    total = blocks_before(top + 1)
    is_p = sieve(total)
    os.makedirs(os.path.join(HERE, "renders"), exist_ok=True)
    for centre in centres:
        path = render_slice(centre, is_p)
        base = blocks_before(centre)
        n_sur = n_pri = 0
        for l in (centre - 1, centre, centre + 1):
            b = blocks_before(l)
            for off in range(l * l):
                N = b + off + 1
                if gcd(N, WHEEL) == 1 and N > 7:
                    n_sur += 1
                    n_pri += is_p[N]
        print(f"slice {centre - 1}-{centre + 1}: {n_sur} survivors, "
              f"{n_pri} prime ({n_pri / n_sur:.1%})  -> {os.path.relpath(path)}")


if __name__ == "__main__":
    main()
