# The Prime Pyramid Law (square-based pyramid)

## Construction

The pyramid has `L` layers. Layer `l` (counted from the top, starting at 1)
is an `l × l` square of blocks. Blocks are numbered top-down, layer by
layer, row by row:

```
N(l, r, c) = B(l) + (r − 1)·l + c        with 1 ≤ r, c ≤ l
B(l)       = (l − 1)·l·(2l − 1) / 6      (blocks in all earlier layers)
```

For 100 levels the pyramid holds 338,350 blocks, of which 29,069 are prime
(8.59%).

## The Law

> **Prime Pyramid Law.** Every prime block greater than 5 satisfies
> `N mod 30 ∈ {1, 7, 11, 13, 17, 19, 23, 29}`, and every prime block
> greater than 7 satisfies `gcd(N mod 210, 210) = 1` (48 of the 210
> residue classes). Primes are therefore confined to a fixed, repeating
> modular lattice of the pyramid — they can never occupy an arbitrary
> block.

Both versions were tested against every block of the 100-level pyramid:

| Law | Skeleton size | Blocks forbidden | Primes checked | Violations | Prime density on skeleton |
|---|---|---|---|---|---|
| v1, mod 30 | 8/30 residues (26.67%) | 248,124 (73.33%) | 29,066 | **0** | 32.21% |
| v2, mod 210 | 48/210 residues (22.86%) | 261,013 (77.14%) | 29,065 | **0** | 37.58% |

Every off-skeleton block is provably composite (divisible by 2, 3, 5 — or
also 7 for v2). The skeleton does not promise a block *is* prime; it is a
**positional law**: if a block is prime, it must sit on the lattice. On the
lattice the prime density jumps from 8.59% (pyramid-wide) to 37.58%
(mod 210) — the skeleton concentrates the primes by a factor of ~4.4.

Comparing v1 and v2 at 100 levels: mod 30 already explains the dominant
visible structure (the bands and dead columns). Moving to mod 210 removes
only 3.8% more of the pyramid (the multiples of 7 not already caught), so
the extra stripes it deletes are sparse — visible as a thinning of the
lattice, not a new large-scale pattern.

## Why the layers look striped

Inside layer `l`, moving one column right adds 1 and moving one row down
adds `l`. So modulo 30 the whole layer pattern is determined by just two
numbers — its **fingerprint**:

```
fingerprint(l) = ( B(l) mod 30,  l mod 30 )
```

- The allowed cells in row `r` are the columns with
  `(r − 1)·l + c ≡ ρ − B(l) (mod 30)` for one of the 8 allowed `ρ`.
- Each row's allowed columns are the previous row's shifted left by
  `l mod 30` — giving **diagonal stripes of slope −l mod 30**.
- Even layers instantly kill half the columns (all even `N` share column
  parity when `l` is even), which is why even layers show strong vertical
  banding — see `renders/layer100_mod30.png`.
- Odd layers tilt the lattice into diagonals — see
  `renders/layer097_mod210.png`.

**The skeleton itself repeats.** A block of 30 consecutive squares sums to
5 (mod 30), so `B(l) mod 30` has period 180 in `l`, while `l mod 30` has
period 30. Verified numerically:

- mod 30: layer fingerprints repeat with **period 180 layers**
- mod 210: layer fingerprints repeat with **period 1260 layers**

So the bands, empty regions, and layer-to-layer shifts observed in the
pyramid are not accidents: they are the geometric image of divisibility by
2, 3, 5 (and 7), and the entire catalogue of possible layer patterns is
finite and cyclic.

## Where this goes next

The skeleton is the deterministic half of the story — *where* primes may
sit. The analytic half — *how many* arrive per layer, and why the counts
wobble — is governed by the zeros of the Riemann zeta function. That
extension (Law v3) is built and verified in
[`RIEMANN-CONNECTION.md`](RIEMANN-CONNECTION.md).

## Files

- `prime_pyramid_law.py` — builds the pyramid, sieves primes, verifies
  both laws, computes fingerprint periods, renders comparison images.
  Pure Python 3, no dependencies. Run `python3 prime_pyramid_law.py [levels]`.
- `renders/layerNNN_modM.png` — per-layer comparisons. Pink = prime,
  dark blue = on-skeleton composite, near-black = forbidden by the law,
  yellow = a law violation (none exist).
