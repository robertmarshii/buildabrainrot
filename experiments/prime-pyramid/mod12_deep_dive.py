#!/usr/bin/env python3
"""Deep dive on the (r-c) mod 12 anomaly in non-leak layers (Exp. B, cont.)

decompose_mod12.py refuted the Chebyshev-leak explanation: the signal
concentrates in layers where NO divisor of 12 >= 3 divides n+1 (so
(r-c) mod 12 has no congruence channel to N mod 12), with no number-line
counterpart and no (r+c) mirror. Before reading that as geometry:

  1. permutation-test the non-leak subset directly (the analytic p-value
     is only an approximation);
  2. localize the component: is it really mod 12, or a mod 3 / mod 4 /
     mod 6 sub-pattern?
  3. per-class z-scores: which classes are hot/cold, is there a shape?
  4. split-half replication inside the non-leak subset (n odd vs even,
     and first vs second half by depth): a real effect appears in
     independent halves with the SAME class pattern.

Usage: python3 mod12_deep_dive.py [levels] [n_perm]   (default 100 1000)
"""

import random
import sys
from math import sqrt

from prime_pyramid_law import blocks_before, sieve
from feature_screen import survivors, wh_pvalue

WHEEL = 30030


def non_leak(n):
    return all(n % m != m - 1 for m in (3, 4, 6, 12))


def stats(rows, mod):
    layer_tot, layer_pri = {}, {}
    for n, r, c, pr in rows:
        layer_tot[n] = layer_tot.get(n, 0) + 1
        layer_pri[n] = layer_pri.get(n, 0) + pr
    rate = {n: layer_pri[n] / layer_tot[n] for n in layer_tot}
    table = {}
    for n, r, c, pr in rows:
        p = rate[n]
        t = table.setdefault((r - c) % mod, [0.0, 0.0, 0.0])
        t[0] += pr
        t[1] += p
        t[2] += p * (1 - p)
    chi2 = sum((o - e) ** 2 / v for o, e, v in table.values() if v > 0)
    return chi2, table, rate


def perm_pvalue(rows, mod, n_perm, seed=42):
    rng = random.Random(seed)
    chi2_obs, _, rate = stats(rows, mod)
    by_layer = {}
    for i, x in enumerate(rows):
        by_layer.setdefault(x[0], []).append(i)
    labels = [x[3] for x in rows]
    vals = [(r - c) % mod for _, r, c, _ in rows]
    p_of = [rate[x[0]] for x in rows]
    beats = 0
    perm = labels[:]
    for _ in range(n_perm):
        for idxs in by_layer.values():
            sub = [perm[i] for i in idxs]
            rng.shuffle(sub)
            for i, v in zip(idxs, sub):
                perm[i] = v
        table = {}
        for i, v in enumerate(vals):
            t = table.setdefault(v, [0.0, 0.0, 0.0])
            p = p_of[i]
            t[0] += perm[i]
            t[1] += p
            t[2] += p * (1 - p)
        chi2 = sum((o - e) ** 2 / va for o, e, va in table.values() if va > 0)
        beats += chi2 >= chi2_obs
    return chi2_obs, (beats + 1) / (n_perm + 1)


def class_z(rows, mod=12):
    _, table, _ = stats(rows, mod)
    return {k: (o - e) / sqrt(v) for k, (o, e, v) in sorted(table.items())
            if v > 0}


def show_z(tag, rows):
    zs = class_z(rows)
    line = " ".join(f"{k}:{z:+.1f}" for k, z in zs.items())
    print(f"  {tag:>26}: {line}")


def main():
    levels = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    n_perm = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
    total = blocks_through = blocks_before(levels + 1)
    is_p = sieve(total)
    rows = [x for x in survivors(levels, is_p, WHEEL)
            if non_leak(x[0]) and x[0] >= 8]
    print(f"non-leak survivors (layers >= 8): {len(rows)}")

    print(f"\n=== 1. Permutation test on the clean subset "
          f"({n_perm} within-layer shuffles) ===")
    for mod in (12, 6, 4, 3):
        chi2, p = perm_pvalue(rows, mod, n_perm)
        print(f"  (r-c) mod {mod:>2}: chi2 = {chi2:6.1f}, "
              f"empirical p = {p:.4f}")

    print("\n=== 2. Per-class z-scores, (r-c) mod 12 ===")
    show_z("all non-leak layers", rows)

    print("\n=== 3. Split-half replication ===")
    show_z("n odd", [x for x in rows if x[0] % 2 == 1])
    show_z("n even", [x for x in rows if x[0] % 2 == 0])
    mid = sorted({x[0] for x in rows})
    mid = mid[len(mid) // 2]
    show_z(f"shallow (n < {mid})", [x for x in rows if x[0] < mid])
    show_z(f"deep (n >= {mid})", [x for x in rows if x[0] >= mid])

    print("\n=== 4. Breakdown by n mod 12 (chi2 per group) ===")
    groups = {}
    for x in rows:
        groups.setdefault(x[0] % 12, []).append(x)
    for g in sorted(groups):
        chi2, table, _ = stats(groups[g], 12)
        df = len(table) - 1
        print(f"  n = {g:>2} (mod 12): n={len(groups[g]):>6}  "
              f"chi2={chi2:6.1f} df={df:>2}  p={wh_pvalue(chi2, df):.3f}")


if __name__ == "__main__":
    main()
