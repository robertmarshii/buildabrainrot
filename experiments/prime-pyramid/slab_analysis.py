#!/usr/bin/env python3
"""3D slab experiment (investigation doc secs. 17-21): layers 11-19.

Population: wheel-30030 survivors (composites divisible by 2,3,5,7,11,13
are background lattice, category 1). Labels: prime vs composite survivor.

Tests, corner-aligned coordinates (the doc's (r,c,n) -> (r+dr,c+dc,n+1)):

  A. translation: for each (dr,dc) in [-3,3]^2, count prime->prime hits
     between consecutive layers;
  B. 3D lines: for each slope (dr,dc) in [-2,2]^2, count prime triples
     through three consecutive layers.

Null model: shuffle labels within each layer among that layer's survivor
positions (preserves all geometry + per-layer prime counts). Significance
via the max-statistic over the whole rule family (controls the multiple
comparisons across all offsets tested).

Protocol: rules are RANKED on the discovery slab 11-19, FROZEN, then
scored without modification on unseen slabs 29-37 and 41-49. Prime-indexed
target layers are tallied separately (doc sec. 20, outcomes 1-3).

Usage: python3 slab_analysis.py [n_perm]   (default 500)
"""

import random
import sys
from math import gcd, sqrt

from prime_pyramid_law import blocks_before, sieve

WHEEL = 30030
PRIMES_SET = None
TRANS = [(dr, dc) for dr in range(-3, 4) for dc in range(-3, 4)]
SLOPES = [(dr, dc) for dr in range(-2, 3) for dc in range(-2, 3)]


def load_slab(a, b, is_p):
    """{layer: dict (r,c) -> bool prime} over wheel survivors."""
    slab = {}
    for n in range(a, b + 1):
        base = blocks_before(n)
        d = {}
        for r in range(n):
            row = base + r * n
            for c in range(n):
                N = row + c + 1
                if N > 13 and gcd(N, WHEEL) == 1:
                    d[(r, c)] = bool(is_p[N])
        slab[n] = d
    return slab


def translation_scores(slab, layers):
    """{(dr,dc): prime->prime hit count} over consecutive layer pairs."""
    out = {t: 0 for t in TRANS}
    for n in layers[:-1]:
        cur, nxt = slab[n], slab[n + 1]
        cur_primes = [rc for rc, pr in cur.items() if pr]
        for r, c in cur_primes:
            for dr, dc in TRANS:
                if nxt.get((r + dr, c + dc)):
                    out[(dr, dc)] += 1
    return out


def line_scores(slab, layers):
    """{(dr,dc): prime-triple count} through three consecutive layers."""
    out = {s: 0 for s in SLOPES}
    for n in layers[:-2]:
        l0, l1, l2 = slab[n], slab[n + 1], slab[n + 2]
        p0 = [rc for rc, pr in l0.items() if pr]
        for r, c in p0:
            for dr, dc in SLOPES:
                if l1.get((r + dr, c + dc)) and l2.get((r + 2 * dr,
                                                       c + 2 * dc)):
                    out[(dr, dc)] += 1
    return out


def shuffled(slab, rng):
    out = {}
    for n, d in slab.items():
        keys = list(d)
        vals = list(d.values())
        rng.shuffle(vals)
        out[n] = dict(zip(keys, vals))
    return out


def analyse(slab, layers, scorer, family, n_perm, rng, frozen=None):
    """Observed scores vs within-layer-shuffle null.

    Returns list of (rule, obs, mean, sd, z) and the max-corrected
    empirical p of the best rule (or of `frozen` rules if given).
    """
    obs = scorer(slab, layers)
    sums = {t: 0.0 for t in family}
    sqs = {t: 0.0 for t in family}
    maxes = []
    frozen_beats = 0
    frozen_obs = sum(obs[t] for t in frozen) if frozen else None
    for _ in range(n_perm):
        s = scorer(shuffled(slab, rng), layers)
        zs = []
        for t in family:
            sums[t] += s[t]
            sqs[t] += s[t] ** 2
        maxes.append(max(s.values()))
        if frozen:
            frozen_beats += sum(s[t] for t in frozen) >= frozen_obs
    rows = []
    for t in family:
        mean = sums[t] / n_perm
        var = sqs[t] / n_perm - mean ** 2
        sd = sqrt(max(var, 1e-12))
        rows.append((t, obs[t], mean, sd, (obs[t] - mean) / sd))
    rows.sort(key=lambda x: -x[4])
    best_obs = rows[0][1]
    p_max = (sum(m >= best_obs for m in maxes) + 1) / (n_perm + 1)
    p_frozen = (frozen_beats + 1) / (n_perm + 1) if frozen else None
    return rows, p_max, p_frozen


def prime_layer_split(slab, layers, rules, scorer_pairwise):
    """Hit counts split by whether the TARGET layer index is prime."""
    def is_prime(k):
        return k > 1 and all(k % i for i in range(2, int(k ** 0.5) + 1))
    hits_p = hits_c = 0
    for n in layers[:-1]:
        cur, nxt = slab[n], slab[n + 1]
        for r, c in [rc for rc, pr in cur.items() if pr]:
            for dr, dc in rules:
                if nxt.get((r + dr, c + dc)):
                    if is_prime(n + 1):
                        hits_p += 1
                    else:
                        hits_c += 1
    return hits_p, hits_c


def main():
    n_perm = int(sys.argv[1]) if len(sys.argv) > 1 else 500
    rng = random.Random(20260814)
    top = 49 + 2
    is_p = sieve(blocks_before(top + 1))

    disco_layers = list(range(11, 20))
    slab = load_slab(11, 19, is_p)
    n_sur = sum(len(d) for d in slab.values())
    n_pri = sum(sum(d.values()) for d in slab.values())
    print(f"=== Discovery slab 11-19 ===")
    print(f"survivors {n_sur}, primes {n_pri} ({n_pri / n_sur:.0%})")

    print(f"\n--- A. translations (dr,dc), {n_perm} shuffles ---")
    rows, p_max, _ = analyse(slab, disco_layers, translation_scores,
                             TRANS, n_perm, rng)
    print(f"{'rule':>10} {'obs':>4} {'null':>7} {'z':>6}")
    for t, o, m, sd, z in rows[:6]:
        print(f"{str(t):>10} {o:>4} {m:>7.2f} {z:>+6.2f}")
    print(f"max-corrected p of best rule: {p_max:.3f}")
    frozen_trans = [r[0] for r in rows[:3]]
    print(f"FROZEN translation rules: {frozen_trans}")

    print(f"\n--- B. 3D lines (slope dr,dc through 3 layers) ---")
    rows_l, p_max_l, _ = analyse(slab, disco_layers, line_scores,
                                 SLOPES, n_perm, rng)
    for t, o, m, sd, z in rows_l[:4]:
        print(f"{str(t):>10} {o:>4} {m:>7.2f} {z:>+6.2f}")
    print(f"max-corrected p of best slope: {p_max_l:.3f}")
    frozen_lines = [r[0] for r in rows_l[:3]]
    print(f"FROZEN line slopes: {frozen_lines}")

    hp, hc = prime_layer_split(slab, disco_layers, frozen_trans,
                               translation_scores)
    print(f"\nfrozen-rule hits by target layer type (sec. 20): "
          f"prime-indexed {hp}, composite-indexed {hc}")

    for a, b in ((29, 37), (41, 49)):
        print(f"\n=== Validation slab {a}-{b} (rules frozen, untouched) ===")
        vslab = load_slab(a, b, is_p)
        vlayers = list(range(a, b + 1))
        _, _, p_t = analyse(vslab, vlayers, translation_scores, TRANS,
                            n_perm, rng, frozen=frozen_trans)
        _, _, p_l = analyse(vslab, vlayers, line_scores, SLOPES,
                            n_perm, rng, frozen=frozen_lines)
        print(f"  frozen translations {frozen_trans}: combined p = {p_t:.3f}")
        print(f"  frozen line slopes  {frozen_lines}: combined p = {p_l:.3f}")
        hp, hc = prime_layer_split(vslab, vlayers, frozen_trans,
                                   translation_scores)
        print(f"  hits by target layer type: prime-indexed {hp}, "
              f"composite-indexed {hc}")

    print("\nReading: a real 3D structure must show max-corrected p < 0.05")
    print("in discovery AND frozen-rule p < 0.05 in BOTH validation slabs.")


if __name__ == "__main__":
    main()
