#!/usr/bin/env python3
"""Prime Pyramid Law — square-based pyramid edition.

Construction
------------
The pyramid has L layers. Layer l (1-indexed from the top) is an l x l
square of blocks. Blocks are numbered top-down, layer by layer, row by
row, column by column, starting at 1:

    N(l, r, c) = B(l) + (r - 1) * l + c,   1 <= r, c <= l

where B(l) = sum of k^2 for k < l = (l - 1) * l * (2l - 1) / 6 is the
number of blocks in all earlier layers.

Candidate laws
--------------
v1 (mod 30 = 2*3*5):   every prime block > 5 satisfies
                       N mod 30 in {1,7,11,13,17,19,23,29}   (8 of 30)
v2 (mod 210 = 2*3*5*7): every prime block > 7 satisfies
                       N mod 210 coprime to 210              (48 of 210)

This script builds the pyramid, sieves the primes, verifies both laws,
measures how much of the visible pattern each skeleton explains, derives
the per-layer "fingerprint" geometry, and renders comparison images.

Usage:  python3 prime_pyramid_law.py [levels]   (default 100)
"""

import sys
import os
import zlib
import struct
from math import gcd

# ---------------------------------------------------------------- pyramid

def blocks_before(l):
    """B(l): total blocks in layers 1 .. l-1."""
    m = l - 1
    return m * (m + 1) * (2 * m + 1) // 6


def block_number(l, r, c):
    return blocks_before(l) + (r - 1) * l + c


def sieve(n):
    """Boolean prime table for 0..n."""
    is_p = bytearray([1]) * (n + 1)
    is_p[0:2] = b"\x00\x00"
    i = 2
    while i * i <= n:
        if is_p[i]:
            is_p[i * i :: i] = b"\x00" * len(range(i * i, n + 1, i))
        i += 1
    return is_p

# ---------------------------------------------------------------- laws

def allowed_residues(modulus):
    return sorted(r for r in range(modulus) if gcd(r, modulus) == 1)


def verify_law(levels, is_p, modulus, small_primes):
    """Check every prime block > max(small_primes) sits on the skeleton.

    Returns (primes_checked, violations, stats-dict).
    """
    ok = set(allowed_residues(modulus))
    total = blocks_before(levels + 1)
    primes_checked = violations = 0
    allowed_blocks = allowed_prime = allowed_composite = 0
    threshold = max(small_primes)
    for n in range(1, total + 1):
        on_skel = (n % modulus) in ok
        if on_skel:
            allowed_blocks += 1
            if is_p[n]:
                allowed_prime += 1
            else:
                allowed_composite += 1
        if is_p[n] and n > threshold:
            primes_checked += 1
            if not on_skel:
                violations += 1
    stats = {
        "modulus": modulus,
        "residues": len(ok),
        "total_blocks": total,
        "allowed_blocks": allowed_blocks,
        "allowed_fraction": allowed_blocks / total,
        "primes_checked": primes_checked,
        "violations": violations,
        "precision": allowed_prime / allowed_blocks if allowed_blocks else 0.0,
        "allowed_prime": allowed_prime,
        "allowed_composite": allowed_composite,
    }
    return stats

# ---------------------------------------------------------------- geometry

def layer_fingerprint(l, modulus):
    """The layer pattern mod `modulus` is fully determined by this pair:
    base residue B(l) mod m and the row-step l mod m (column step is +1)."""
    return (blocks_before(l) % modulus, l % modulus)


def fingerprint_period(modulus, max_layers=20000):
    """Smallest p with fingerprint(l + p) == fingerprint(l) for all l."""
    fps = [layer_fingerprint(l, modulus) for l in range(1, max_layers + 1)]
    n = len(fps)
    for p in range(1, n):
        if all(fps[i] == fps[i + p] for i in range(n - p)):
            return p
    return None

# ---------------------------------------------------------------- png

def write_png(path, pixels):
    """pixels: list of rows, each row a list of (r, g, b)."""
    h, w = len(pixels), len(pixels[0])
    raw = b"".join(
        b"\x00" + b"".join(struct.pack("BBB", *px) for px in row) for row in pixels
    )
    def chunk(tag, data):
        payload = tag + data
        return struct.pack(">I", len(data)) + payload + struct.pack(
            ">I", zlib.crc32(payload) & 0xFFFFFFFF
        )
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        f.write(chunk(b"IEND", b""))


PRIME_ON_SKEL = (255, 64, 129)   # prime block (always on skeleton)
SKEL_ONLY = (68, 68, 110)        # allowed by skeleton, but composite
FORBIDDEN = (18, 18, 24)         # off-skeleton: provably composite
VIOLATION = (255, 255, 0)        # prime off-skeleton — must never appear


def render_layer(levels_dir, l, is_p, modulus, scale=8):
    ok = set(allowed_residues(modulus))
    small = {p for p in (2, 3, 5, 7) if modulus % p == 0}
    grid = []
    for r in range(1, l + 1):
        row = []
        for c in range(1, l + 1):
            n = block_number(l, r, c)
            on_skel = (n % modulus) in ok or n in small
            if is_p[n]:
                row.append(PRIME_ON_SKEL if on_skel else VIOLATION)
            else:
                row.append(SKEL_ONLY if on_skel else FORBIDDEN)
        grid.append(row)
    pixels = [
        [grid[r][c] for c in range(l) for _ in range(scale)]
        for r in range(l)
        for _ in range(scale)
    ]
    path = os.path.join(levels_dir, f"layer{l:03d}_mod{modulus}.png")
    write_png(path, pixels)
    return path

# ---------------------------------------------------------------- main

def main():
    levels = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    total = blocks_before(levels + 1)
    print(f"Square-based pyramid, {levels} levels, {total} blocks (1..{total})")
    print(f"N(l,r,c) = (l-1)l(2l-1)/6 + (r-1)l + c\n")

    is_p = sieve(total)
    n_primes = sum(is_p[1:])
    print(f"Primes in the pyramid: {n_primes} "
          f"({n_primes / total:.2%} of all blocks)\n")

    results = []
    for modulus, small in ((30, (2, 3, 5)), (210, (2, 3, 5, 7))):
        s = verify_law(levels, is_p, modulus, small)
        results.append(s)
        name = "v1 (mod 30)" if modulus == 30 else "v2 (mod 210)"
        print(f"--- Law {name} ---")
        print(f"  allowed residues:        {s['residues']}/{modulus} "
              f"({s['residues'] / modulus:.2%} of positions)")
        print(f"  primes > {max(small)} checked:      {s['primes_checked']}")
        print(f"  violations:              {s['violations']}"
              + ("   <-- LAW HOLDS" if s["violations"] == 0 else "  <-- LAW BROKEN"))
        print(f"  skeleton blocks:         {s['allowed_blocks']} "
              f"({s['allowed_fraction']:.2%} of pyramid)")
        print(f"  forbidden blocks:        {s['total_blocks'] - s['allowed_blocks']} "
              f"— all provably composite")
        print(f"  prime density on skel.:  {s['precision']:.2%} "
              f"(vs {n_primes / total:.2%} overall)\n")

    print("--- Layer fingerprint geometry ---")
    print("Within layer l: one column right = +1, one row down = +l.")
    print("So the layer pattern mod m is fixed by (B(l) mod m, l mod m).")
    for modulus in (30, 210):
        p = fingerprint_period(modulus)
        print(f"  mod {modulus}: fingerprint period = {p} layers "
              f"(pattern of every layer repeats exactly every {p} layers)")
    print("  Special case: when l = 0 mod m the row-step vanishes -> vertical")
    print("  stripe columns; otherwise the stripes are diagonals of slope -l mod m.\n")

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "renders")
    os.makedirs(out, exist_ok=True)
    sample_layers = [l for l in (30, 60, 97, 100) if l <= levels]
    print("--- Rendering skeleton-vs-prime comparisons ---")
    for l in sample_layers:
        for modulus in (30, 210):
            path = render_layer(out, l, is_p, modulus)
            print(f"  wrote {os.path.relpath(path)}")
    print("\nColor key: pink = prime, dark blue = skeleton (composite),")
    print("near-black = forbidden by law, yellow = violation (never appears).")

    if all(s["violations"] == 0 for s in results):
        print("\nRESULT: both laws hold with zero violations. Every prime in the")
        print("pyramid sits on the modular skeleton; the skeleton alone forbids")
        print(f"{1 - results[1]['allowed_fraction']:.2%} of all blocks (mod 210).")


if __name__ == "__main__":
    main()
