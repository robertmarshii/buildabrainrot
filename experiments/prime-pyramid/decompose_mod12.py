#!/usr/bin/env python3
"""Decompose the surviving (r-c) mod 12 signal (Exp. B follow-up).

The stratified screen left one replicating feature under the extended
wheel 30030: (r-c) mod 12. Hypothesis: it is NOT pyramid geometry but
the Chebyshev bias (prime race) leaking through the congruence channel

    layers with n = -1 (mod m), m | 12:  r*n + c = c - r  (mod m)
    =>  (r-c) mod 12 partially encodes N mod 12 in those layers.

Three checks, any of which can kill the geometric reading:
  1. leak split  - the signal should live in layers n = -1 (mod 12)
                   (and, diluted, n = -1 mod 6/4/3) and vanish in layers
                   with no divisor channel;
  2. number line - among wheel-30030 survivors the prime rate by N mod 12
                   in {1,5,7,11} should show the same-size bias with no
                   geometry involved;
  3. symmetry    - layers n = +1 (mod 12) leak through (r+c) instead;
                   if the effect is arithmetic, (r+c) mod 12 restricted
                   to ITS leak layers must show the mirror-image signal.

Usage: python3 decompose_mod12.py [levels]   (default 100)
"""

import sys
from math import gcd

from prime_pyramid_law import blocks_before, sieve
from feature_screen import survivors, wh_pvalue

WHEEL = 30030


def stratified_chi2(rows, valfn):
    """Layer-stratified chi-square of prime label vs valfn(n, r, c)."""
    layer_tot, layer_pri = {}, {}
    for n, r, c, pr in rows:
        layer_tot[n] = layer_tot.get(n, 0) + 1
        layer_pri[n] = layer_pri.get(n, 0) + pr
    rate = {n: layer_pri[n] / layer_tot[n] for n in layer_tot}
    table = {}
    for n, r, c, pr in rows:
        p = rate[n]
        t = table.setdefault(valfn(n, r, c), [0.0, 0.0, 0.0])
        t[0] += pr
        t[1] += p
        t[2] += p * (1 - p)
    chi2 = sum((o - e) ** 2 / v for o, e, v in table.values() if v > 0)
    return chi2, len(table) - 1, table


def report(tag, rows, valfn):
    if not rows:
        print(f"  {tag:>34}: (no survivors)")
        return
    chi2, df, _ = stratified_chi2(rows, valfn)
    p = wh_pvalue(chi2, df)
    print(f"  {tag:>34}: n={len(rows):>6}  chi2={chi2:7.1f} df={df:>2}  "
          f"p={p:.2e}")


def main():
    levels = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    total = blocks_before(levels + 1)
    is_p = sieve(total)
    rows = list(survivors(levels, is_p, WHEEL))

    rc = lambda n, r, c: (r - c) % 12

    print("=== 1. Leak split for (r-c) mod 12, wheel 30030 ===")
    print("channel strength per layer: m = gcd-style largest divisor of 12")
    print("with n = -1 (mod m); 'none' = no divisor of 12 has n = -1")
    def channel(n):
        for m in (12, 6, 4, 3, 2):
            if n % m == m - 1:
                return m
        return 0
    for m in (12, 6, 4, 3):
        rs = [x for x in rows if channel(x[0]) == m]
        report(f"leak layers (strongest m={m})", rs, rc)
    rs = [x for x in rows if channel(x[0]) in (0, 2)]
    report("non-leak layers (m<=2)", rs, rc)

    print("\n=== 2. Pure number line: prime rate by N mod 12 ===")
    print("(wheel-30030 survivors, NO geometry - split by depth band)")
    for a, b in ((8, 50), (51, 100)):
        band = [(n, r, c, pr) for n, r, c, pr in rows if a <= n <= b]
        cls = {}
        for n, r, c, pr in band:
            N = blocks_before(n) + r * n + c + 1
            t = cls.setdefault(N % 12, [0, 0])
            t[pr] += 1
        chi2, df, _ = stratified_chi2(
            band, lambda n, r, c: (blocks_before(n) + r * n + c + 1) % 12)
        print(f"  layers {a}-{b}: ", end="")
        for k in sorted(cls):
            comp, pri = cls[k]
            print(f"[{k}] {pri / (comp + pri):.1%} ", end="")
        print(f" chi2={chi2:.1f} p={wh_pvalue(chi2, df):.2e}")

    print("\n=== 3. Mirror check: (r+c) mod 12 in ITS leak layers ===")
    def channel_plus(n):
        for m in (12, 6, 4, 3, 2):
            if n % m == 1:
                return m
        return 0
    ac = lambda n, r, c: (r + c) % 12
    for m in (12, 6, 4, 3):
        rs = [x for x in rows if channel_plus(x[0]) == m]
        report(f"(r+c) leak layers (m={m})", rs, ac)
    rs = [x for x in rows if channel_plus(x[0]) in (0, 2)]
    report("(r+c) non-leak layers", rs, ac)

    print("\nReading: if the (r-c) signal concentrates in its leak layers,")
    print("the number line shows the same bias, and (r+c) mirrors it in its")
    print("own leak layers, then the screen's survivor is the Chebyshev")
    print("bias wearing pyramid coordinates - arithmetic, not geometry.")


if __name__ == "__main__":
    main()
