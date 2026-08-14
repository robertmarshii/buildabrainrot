#!/usr/bin/env python3
"""Rays through the pyramid vs Hardy-Littlewood predictions (Exp. D).

A ray follows a fixed rule for (r, c) down the layers, so its block
number is an integer-valued cubic in the layer index n:

  top-left family   TL(r0,c0):  N(n) = B(n) + r0*n + c0 + 1
  bottom-right      BR(a,b):    N(n) = B(n) + n^2 - a*n - b
                                (r = n-1-a, c = n-1-b)

with B(n) = (n-1)n(2n-1)/6 and 6*N(n) = g(n) an integer cubic.

Prime-rich rays ARE prime-rich cubics, so the Bateman-Horn (Hardy-
Littlewood) conjecture makes a quantitative prediction per ray:

  E[primes on ray] = C(f) * sum_n 1/ln f(n),
  C(f) = prod_p (1 - w_f(p)/p) / (1 - 1/p),

where w_f(p) counts roots of g mod p (p >= 5; p = 2, 3 use the exact
density of divisible values over a period). Two degenerate classes are
predicted in advance:

  * reducible: g has a rational root  -> finitely many primes, ever;
  * fixed divisor: some p divides every f(n)  ->  C = 0.

The test: actual prime count A vs prediction E for every generic ray,
z = (A - E)/sqrt(E). HL confirmed if z ~ N(0,1) with no ray beating the
multiplicity-corrected bound. A ray with z >> max-expected would be the
genuinely surprising object.

Usage: python3 rays_hardy_littlewood.py [levels] [offsets] [prime_limit]
       (defaults 500 10 3000)
"""

import math
import os
import sys

from prime_pyramid_law import blocks_before, sieve

HERE = os.path.dirname(os.path.abspath(__file__))
N_LO = 12


def ray_value(fam, u, v, n):
    if fam == "TL":
        return blocks_before(n) + u * n + v + 1
    return blocks_before(n) + n * n - u * n - v


def g_coeffs(fam, u, v):
    """Integer coefficients of g(n) = 6*N(n), highest degree first."""
    if fam == "TL":
        return (2, -3, 1 + 6 * u, 6 * (v + 1))
    return (2, 3, 1 - 6 * u, -6 * v)


def rational_root(coeffs):
    """A rational root p/q of the integer cubic, or None."""
    k3, k2, k1, k0 = coeffs
    if k0 == 0:
        return (0, 1)
    for p in range(1, abs(k0) + 1):
        if abs(k0) % p:
            continue
        for q in (1, 2):
            for sp in (p, -p):
                if k3 * sp ** 3 + k2 * sp ** 2 * q + k1 * sp * q * q \
                        + k0 * q ** 3 == 0:
                    return (sp, q)
    return None


def prime_list(limit):
    s = sieve(limit)
    return [p for p in range(2, limit + 1) if s[p]]


def hl_constants(rays, primes):
    """C(f) for every ray, sharing one pass over the primes.

    For each prime p >= 5 and each n mod p, the root condition
    g(n) = 0 (mod p) is linear in the ray parameters, so each (p, n)
    pinpoints exactly one parameter value per family row - O(p * offsets)
    instead of O(p * rays).
    """
    offsets = max(u for _, u, _ in rays) + 1
    logC = {ray: 0.0 for ray in rays}
    dead = set()
    # p = 2, 3 by exact density: f mod 2 has period 4 (four consecutive
    # squares sum to 0 mod 2) and f mod 3 has period 9, so a window of
    # 36 consecutive n captures both exactly.
    for ray in rays:
        fam, u, v = ray
        for p in (2, 3):
            hits = sum(1 for n in range(612, 648)
                       if ray_value(fam, u, v, n) % p == 0)
            delta = hits / 36
            if delta == 1.0:
                dead.add(ray)
            else:
                logC[ray] += math.log((1 - delta) / (1 - 1 / p))
    for p in primes:
        if p < 5:
            continue
        inv6 = pow(6, -1, p)
        omega = {}
        for n in range(p):
            base_tl = (2 * n ** 3 - 3 * n ** 2 + n) % p
            base_br = (2 * n ** 3 + 3 * n ** 2 + n) % p
            for u in range(offsets):
                # TL: base + 6*u*n + 6*(v+1) = 0  ->  v = -(base+6un)/6 - 1
                vres = (-(base_tl + 6 * u * n) * inv6 - 1) % p
                # every ray parameter in that residue class has this root
                for v in range(vres, offsets, p):
                    key = ("TL", u, v)
                    omega[key] = omega.get(key, 0) + 1
                # BR: base - 6*u*n - 6*v = 0  ->  v = (base - 6un)/6
                vres = ((base_br - 6 * u * n) * inv6) % p
                for v in range(vres, offsets, p):
                    key = ("BR", u, v)
                    omega[key] = omega.get(key, 0) + 1
        lp = math.log(1 - 1 / p)
        for ray in rays:
            w = omega.get(ray, 0)
            if w >= p:
                dead.add(ray)
            else:
                logC[ray] += math.log(1 - w / p) - lp
    return {ray: (0.0 if ray in dead else math.exp(logC[ray]))
            for ray in rays}, dead


def main():
    levels = int(sys.argv[1]) if len(sys.argv) > 1 else 500
    offsets = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    plimit = int(sys.argv[3]) if len(sys.argv) > 3 else 3000
    total = blocks_before(levels + 1)
    print(f"Pyramid {levels} levels ({total:,} blocks); "
          f"{2 * offsets * offsets} rays; HL products over p <= {plimit}")
    is_p = sieve(total)
    primes = prime_list(plimit)

    rays = [(fam, u, v) for fam in ("TL", "BR")
            for u in range(offsets) for v in range(offsets)]
    C, dead = hl_constants(rays, primes)

    results = []
    for ray in rays:
        fam, u, v = ray
        root = rational_root(g_coeffs(fam, u, v))
        A = E = 0.0
        for n in range(N_LO, levels + 1):
            f = ray_value(fam, u, v, n)
            A += is_p[f]
            E += 1 / math.log(f)
        E *= C[ray]
        results.append((ray, root, C[ray], A, E))

    reducible = [x for x in results if x[1] is not None]
    fixed_div = [x for x in results if x[1] is None and x[0] in dead]
    generic = [x for x in results if x[1] is None and x[0] not in dead]

    print(f"\n--- Degenerate classes (predicted in advance) ---")
    print(f"reducible rays (rational root -> finitely many primes): "
          f"{len(reducible)}")
    worst = max(reducible, key=lambda x: x[3], default=None)
    for ray, root, c, A, E in sorted(reducible, key=lambda x: -x[3])[:4]:
        fam, u, v = ray
        print(f"  {fam}({u},{v}): root n={root[0]}/{root[1]}, "
              f"actual primes on layers {N_LO}-{levels}: {int(A)}")
    print(f"fixed-divisor rays (C = 0): {len(fixed_div)}")
    for ray, root, c, A, E in fixed_div[:4]:
        fam, u, v = ray
        print(f"  {fam}({u},{v}): actual primes: {int(A)}")

    print(f"\n--- Generic rays: actual vs Hardy-Littlewood ---")
    zs = []
    for ray, root, c, A, E in generic:
        zs.append((A - E) / math.sqrt(E))
    mean_z = sum(zs) / len(zs)
    sd_z = math.sqrt(sum((z - mean_z) ** 2 for z in zs) / (len(zs) - 1))
    At = sum(x[3] for x in generic)
    Et = sum(x[4] for x in generic)
    print(f"generic rays: {len(generic)}")
    print(f"total primes observed {int(At)}, predicted {Et:.1f} "
          f"(ratio {At / Et:.3f} +- {1 / math.sqrt(At):.3f})")
    print(f"z distribution: mean {mean_z:+.2f}, sd {sd_z:.2f} "
          f"(HL predicts ~0, ~1)")
    import math as _m
    exp_max = _m.sqrt(2 * _m.log(len(generic)))
    print(f"expected max |z| under HL for {len(generic)} rays: "
          f"~{exp_max:.1f}")
    ranked = sorted(generic, key=lambda x: -(x[3] - x[4]) /
                    math.sqrt(x[4]))
    print(f"\n{'ray':>9} {'C(f)':>6} {'actual':>7} {'HL pred':>8} {'z':>6}")
    print("  hottest:")
    for ray, root, c, A, E in ranked[:5]:
        fam, u, v = ray
        z = (A - E) / math.sqrt(E)
        print(f"  {fam}({u},{v}):".rjust(11) +
              f" {c:>6.3f} {int(A):>7} {E:>8.1f} {z:>+6.2f}")
    print("  coldest:")
    for ray, root, c, A, E in ranked[-5:]:
        fam, u, v = ray
        z = (A - E) / math.sqrt(E)
        print(f"  {fam}({u},{v}):".rjust(11) +
              f" {c:>6.3f} {int(A):>7} {E:>8.1f} {z:>+6.2f}")

    out = os.path.join(HERE, "rays_results.tsv")
    with open(out, "w") as fh:
        fh.write("family\tu\tv\tclass\tC\tactual\tpredicted\tz\n")
        for ray, root, c, A, E in results:
            fam, u, v = ray
            cls = ("reducible" if root else
                   "fixed-divisor" if ray in dead else "generic")
            z = (A - E) / math.sqrt(E) if E > 0 else float("nan")
            fh.write(f"{fam}\t{u}\t{v}\t{cls}\t{c:.4f}\t{int(A)}\t"
                     f"{E:.2f}\t{z:.3f}\n")
    print(f"\nfull table -> {os.path.relpath(out)}")

    verdict = abs(mean_z) < 0.3 and max(abs(z) for z in zs) < exp_max + 1
    print("\nVERDICT:", "consistent with Hardy-Littlewood - ray prime "
          "density is fully predicted by C(f)" if verdict else
          "DEVIATION from Hardy-Littlewood - investigate flagged rays")


if __name__ == "__main__":
    main()
