#!/usr/bin/env python3
"""Test the diagonal-wipeout mechanism for the mod-12/mod-3 anomaly.

Mechanism: in layer n, the blocks on diagonal r - c = d form an
arithmetic progression with common difference n + 1:

    N = B(n) + 1 + d*n + c*(n+1)        (c runs along the diagonal)

For any prime q | (n+1), all N on diagonal d are congruent mod q, and
the single class  d = B(n) + 1  (mod q)  is entirely divisible by q.
For q > 13 those blocks pass the 30030 wheel as composite survivors:
divisibility leaking through a genuinely pyramid-geometric channel
(diagonals), invisible to any fixed wheel.

Test: recompute the layer-stratified (r-c) mod 12 / mod 3 chi-square on
non-leak layers after deleting all predicted-wiped blocks (q | n+1,
13 < q <= n, d = B(n)+1 mod q). If the signal collapses, the anomaly is
explained. Also checked: the exact main diagonal (d = 0) vs its mod-12
classmates, and the same wipeout logic for columns (step n, q | n) and
anti-diagonals (step n-1, q | n-1).

Usage: python3 diagonal_wipeout.py [levels]   (default 100)
"""

import sys
from math import sqrt

from prime_pyramid_law import blocks_before, sieve
from feature_screen import survivors, wh_pvalue
from mod12_deep_dive import non_leak, stats

WHEEL = 30030


def small_primes(limit):
    sieve_ = bytearray([1]) * (limit + 1)
    sieve_[0:2] = b"\x00\x00"
    for i in range(2, int(limit ** 0.5) + 1):
        if sieve_[i]:
            sieve_[i * i :: i] = b"\x00" * len(range(i * i, limit + 1, i))
    return [p for p in range(17, limit + 1) if sieve_[p]]


def wiped_cells(n, primes):
    """(r, c) cells predicted composite by AP-wipeout channels in layer n."""
    # Mark any cell whose N is divisible by some prime q > 13 dividing
    # n-1, n, or n+1 — the three AP step sizes whose wipeouts align with
    # anti-diagonals, columns, and diagonals respectively.
    B1 = blocks_before(n) + 1
    dead = set()
    for q in primes:
        if q > n + 1:
            break
        if (n - 1) % q and n % q and (n + 1) % q:
            continue
        for r in range(n):
            base = B1 + r * n
            # first c >= 0 with (base + c) % q == 0
            c = (-base) % q
            while c < n:
                dead.add((r, c))
                c += q
    return dead


def report(tag, rows, mod):
    chi2, table, _ = stats(rows, mod)
    df = len(table) - 1
    print(f"  {tag:>44}: n={len(rows):>6}  chi2={chi2:6.1f} df={df:>2}  "
          f"p={wh_pvalue(chi2, df):.2e}")


def main():
    levels = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    total = blocks_before(levels + 1)
    is_p = sieve(total)
    primes = small_primes(levels + 1)
    rows = [x for x in survivors(levels, is_p, WHEEL)
            if non_leak(x[0]) and x[0] >= 8]

    dead_by_layer = {}
    for n in sorted({x[0] for x in rows}):
        dead_by_layer[n] = wiped_cells(n, primes)
    kept = [x for x in rows if (x[1], x[2]) not in dead_by_layer[x[0]]]
    removed = len(rows) - len(kept)
    rem_primes = sum(x[3] for x in rows) - sum(x[3] for x in kept)
    print(f"non-leak survivors: {len(rows)}; predicted-wiped cells removed: "
          f"{removed} (containing {rem_primes} primes - should be ~0)")

    print("\n=== (r-c) mod 12 and mod 3, before vs after wipeout removal ===")
    for mod in (12, 3):
        report(f"before, mod {mod}", rows, mod)
        report(f"after wipeout removal, mod {mod}", kept, mod)

    print("\n=== Exact main diagonal d=0 vs rest of class 0 mod 12 ===")
    def z_of(rows_, pred):
        layer_tot, layer_pri = {}, {}
        for n, r, c, pr in rows_:
            layer_tot[n] = layer_tot.get(n, 0) + 1
            layer_pri[n] = layer_pri.get(n, 0) + pr
        rate = {n: layer_pri[n] / layer_tot[n] for n in layer_tot}
        o = e = v = 0.0
        m = 0
        for n, r, c, pr in rows_:
            if pred(n, r, c):
                p = rate[n]
                o += pr
                e += p
                v += p * (1 - p)
                m += 1
        return m, (o - e) / sqrt(v) if v > 0 else 0.0
    m0, z0 = z_of(rows, lambda n, r, c: r == c)
    mk, zk = z_of(rows, lambda n, r, c: r != c and (r - c) % 12 == 0)
    print(f"  exact d=0:            n={m0:>6}  z={z0:+.2f}")
    print(f"  d=+-12,24,... only:   n={mk:>6}  z={zk:+.2f}")
    m0k, z0k = z_of(kept, lambda n, r, c: r == c)
    print(f"  exact d=0 after wipeout removal: n={m0k:>6}  z={z0k:+.2f}")

    print("\n=== The main-diagonal theorem, verified directly ===")
    print("claim: q >= 5 prime, q | n+1  =>  every diagonal block of")
    print("layer n is divisible by q  (since B(n) = -1 mod q when "
          "n = -1 mod q)")
    bad = 0
    layers_hit = 0
    for n in range(4, levels + 1):
        qs = [q for q in [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
              if (n + 1) % q == 0]
        if not qs:
            continue
        layers_hit += 1
        B1 = blocks_before(n) + 1
        for q in qs:
            for r in range(n):
                if (B1 + r * (n + 1)) % q:
                    bad += 1
    print(f"  layers n <= {levels} with a prime factor >= 5 in n+1: "
          f"{layers_hit}; counterexample blocks: {bad}")


if __name__ == "__main__":
    main()
