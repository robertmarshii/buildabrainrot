#!/usr/bin/env python3
"""Fail-fast screen for within-layer lattice features (Exp. B).

Question (investigation doc, section 16): after controlling for the
wheel sieve, do primes occupy within-layer lattice positions that
composite survivors do not?

Design — built to kill the hypothesis quickly if it is false:

  * population: wheel survivors (gcd(N, 210) = 1, N > 7), labelled
    prime / composite;
  * features: r mod k, c mod k, (r+c) mod k, (r-c) mod k for k = 2..12
    (0-based row r, column c in layer n) — the doc's section-12 list;
  * discovery band: layers 8-50; validation band: layers 51-100.
    A real geometric law must hold in BOTH; a sieve artefact or a
    fluke will not transfer;
  * chi-square per feature (prime/composite x feature class) with a
    Wilson-Hilferty tail p-value and Cramer's V effect size;
  * depth-scaling: V per band (8-30 / 31-60 / 61-100). Dirichlet
    equidistribution predicts real-looking signals shrink with depth;
  * control: extend the wheel to 30030 = 2*3*5*7*11*13 and re-screen.
    PREDICTION: any significant feature is higher-prime divisibility
    (11, 13) leaking through layer-dependent moduli, so it collapses
    under the extended wheel;
  * targeted demo: in layers with 11 | n, column classes mod 11 map
    exactly onto N mod 11, so one column class must be prime-free.

Usage: python3 feature_screen.py [levels]   (default 100)
"""

import sys
from math import gcd, sqrt, erfc

from prime_pyramid_law import blocks_before, sieve

KS = range(2, 13)
FEATURES = [(name, k) for k in KS for name in ("r", "c", "r+c", "r-c")]


def feature_value(name, k, r, c):
    if name == "r":
        return r % k
    if name == "c":
        return c % k
    if name == "r+c":
        return (r + c) % k
    return (r - c) % k


def survivors(levels, is_p, wheel):
    """Yield (layer, r, c, is_prime) for wheel survivors > 7."""
    for n in range(2, levels + 1):
        base = blocks_before(n)
        for r in range(n):
            row = base + r * n
            for c in range(n):
                N = row + c + 1
                if N > 7 and gcd(N, wheel) == 1:
                    yield n, r, c, bool(is_p[N])


def chi2_stats(rows):
    """rows: list of (n, r, c, prime). Returns {feature: (chi2, df, V, p)}.

    LAYER-STRATIFIED: each survivor is compared to its own layer's prime
    rate. Without this, the falling prime rate with depth (82% at layer 8
    -> 35% at layer 100) masquerades as a feature signal whenever class
    occupancy varies across layers (it does: B(n) mod k and n mod k set
    which classes each layer populates).
    """
    layer_tot = {}
    layer_pri = {}
    for n, r, c, pr in rows:
        layer_tot[n] = layer_tot.get(n, 0) + 1
        layer_pri[n] = layer_pri.get(n, 0) + pr
    rate = {n: layer_pri[n] / layer_tot[n] for n in layer_tot}
    # per feature-class: observed primes, expected primes, variance
    acc = {f: {} for f in FEATURES}
    total = len(rows)
    for n, r, c, pr in rows:
        p = rate[n]
        for f in FEATURES:
            t = acc[f].setdefault(feature_value(*f, r, c), [0.0, 0.0, 0.0])
            t[0] += pr
            t[1] += p
            t[2] += p * (1 - p)
    out = {}
    for f, table in acc.items():
        chi2 = sum((obs - exp) ** 2 / var
                   for obs, exp, var in table.values() if var > 0)
        df = len(table) - 1
        v = sqrt(chi2 / total)
        out[f] = (chi2, df, v, wh_pvalue(chi2, df))
    return out


def permutation_test(rows, features, n_perm=300, seed=20260814):
    """Empirical p-values by shuffling labels WITHIN each layer.

    This is the ground-truth test: it preserves every layer's survivor
    geometry and prime count, and asks how often chance alone produces a
    stratified chi-square as large as observed.
    """
    import random
    rng = random.Random(seed)
    by_layer = {}
    for i, (n, _, _, _) in enumerate(rows):
        by_layer.setdefault(n, []).append(i)
    labels = [x[3] for x in rows]
    feat_vals = {f: [feature_value(*f, r, c) for _, r, c, _ in rows]
                 for f in features}
    layer_of = [x[0] for x in rows]
    rate = {}
    for n, idxs in by_layer.items():
        rate[n] = sum(labels[i] for i in idxs) / len(idxs)

    def stat(f, labs):
        table = {}
        vals = feat_vals[f]
        for i, v in enumerate(vals):
            t = table.setdefault(v, [0.0, 0.0, 0.0])
            p = rate[layer_of[i]]
            t[0] += labs[i]
            t[1] += p
            t[2] += p * (1 - p)
        return sum((o - e) ** 2 / va for o, e, va in table.values() if va > 0)

    observed = {f: stat(f, labels) for f in features}
    beats = {f: 0 for f in features}
    perm = labels[:]
    for _ in range(n_perm):
        for idxs in by_layer.values():
            vals = [perm[i] for i in idxs]
            rng.shuffle(vals)
            for i, v in zip(idxs, vals):
                perm[i] = v
        for f in features:
            if stat(f, perm) >= observed[f]:
                beats[f] += 1
    return {f: (beats[f] + 1) / (n_perm + 1) for f in features}


def wh_pvalue(chi2, df):
    """Wilson-Hilferty chi-square upper-tail approximation."""
    if df <= 0:
        return 1.0
    z = ((chi2 / df) ** (1 / 3) - (1 - 2 / (9 * df))) / sqrt(2 / (9 * df))
    return 0.5 * erfc(z / sqrt(2))


def fname(f):
    name, k = f
    return f"({name}) mod {k}"


def screen(levels, is_p, wheel, label):
    rows = list(survivors(levels, is_p, wheel))
    disco = [x for x in rows if 8 <= x[0] <= 50]
    valid = [x for x in rows if x[0] > 50]
    sd, sv = chi2_stats(disco), chi2_stats(valid)
    n_tests = len(FEATURES)
    print(f"\n=== Screen: wheel {wheel} ({label}) ===")
    print(f"survivors: {len(rows)} total, {len(disco)} discovery (L8-50), "
          f"{len(valid)} validation (L51-100)")
    print(f"Bonferroni threshold for {n_tests} tests at 0.01: "
          f"p < {0.01 / n_tests:.1e}")
    print(f"{'feature':>14} {'V disc':>8} {'p disc':>10} "
          f"{'V valid':>8} {'p valid':>10}  verdict")
    ranked = sorted(FEATURES, key=lambda f: sd[f][3])
    for f in ranked[:8]:
        _, _, vd, pd = sd[f]
        _, _, vv, pv = sv[f]
        sig_d = pd < 0.01 / n_tests
        sig_v = pv < 0.01 / n_tests
        verdict = ("REPLICATES" if sig_d and sig_v else
                   "fails validation" if sig_d else "noise")
        print(f"{fname(f):>14} {vd:>8.4f} {pd:>10.1e} "
              f"{vv:>8.4f} {pv:>10.1e}  {verdict}")
    return rows, sd, sv, ranked


def depth_scaling(rows, features):
    bands = [(8, 30), (31, 60), (61, 100)]
    print("\n--- Depth scaling of top features (Cramer's V per band) ---")
    print("(a real geometric law holds its V; Dirichlet says sieve "
          "leakage shrinks)")
    for f in features:
        vs = []
        for a, b in bands:
            band = [x for x in rows if a <= x[0] <= b]
            vs.append(chi2_stats(band)[f][2])
        trend = " -> ".join(f"{v:.4f}" for v in vs)
        print(f"  {fname(f):>14}: {trend}")


def targeted_demo(levels, is_p):
    print("\n--- Targeted demo: layers with 11 | n, column classes mod 11 ---")
    print("(in these layers c mod 11 IS N mod 11, so the class hitting "
          "N=0 mod 11 must be prime-free)")
    for n in (22, 44, 66, 88):
        if n > levels:
            break
        base = blocks_before(n)
        counts = {}
        for r in range(n):
            for c in range(n):
                N = base + r * n + c + 1
                if N > 7 and gcd(N, 210) == 1:
                    cl = N % 11
                    t = counts.setdefault(cl, [0, 0])
                    t[bool(is_p[N])] += 1
        dead = counts.get(0, [0, 0])
        alive = [v[1] / max(1, sum(v)) for k, v in counts.items() if k != 0]
        print(f"  layer {n}: class N=0 mod 11 -> {dead[1]} primes / "
              f"{sum(dead)} survivors; other classes avg prime rate "
              f"{sum(alive) / len(alive):.1%}")


def main():
    levels = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    total = blocks_before(levels + 1)
    is_p = sieve(total)

    rows, sd, sv, ranked = screen(levels, is_p, 210, "the doc's baseline")
    depth_scaling(rows, ranked[:3])
    targeted_demo(levels, is_p)

    # Control: fold 11 and 13 into the wheel; leakage signals must die.
    rows2, _, _, ranked2 = screen(levels, is_p, 30030,
                                  "control - wheel extended to 2*3*5*7*11*13")

    finalists = ranked2[:4]
    print("\n--- Permutation test (within-layer shuffles, wheel 30030) ---")
    print("(the ground-truth check for anything still standing)")
    pp = permutation_test(rows2, finalists)
    for f in finalists:
        print(f"  {fname(f):>14}: empirical p = {pp[f]:.3f}"
              + ("   <-- investigate" if pp[f] < 0.01 else "   (chance)"))

    print("\nInterpretation guide: a feature that is significant under "
          "wheel 210\nbut dies under wheel 30030 was divisibility by 11/13 "
          "wearing a\ngeometric costume - not pyramid structure.")


if __name__ == "__main__":
    main()
