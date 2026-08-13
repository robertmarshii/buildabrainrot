# The Pyramid and the Riemann Zeta Function

Builds on [`PRIME-PYRAMID-LAW.md`](PRIME-PYRAMID-LAW.md) and on the framing
of DataCamp's tutorial
[*Claude Tried the Riemann Hypothesis. Here's What Happened.*](https://www.datacamp.com/tutorial/claude-and-the-riemann-hypothesis)
(companion to [Anthropic's research note](https://www.anthropic.com/research/riemann-zeta),
where a research version of Claude raised the proven lower bound on the
fraction of zeta zeros on the critical line from 41.6% to 67.2%).

The tutorial's central idea: the non-trivial zeros of the Riemann zeta
function `ζ(s)` act as **correction waves** that control the error term in
how the primes thin out. Our square-based pyramid gives that idea a
geometry. Together with the modular law we get a two-part picture:

> **WHERE** primes may sit — the deterministic mod-30 / mod-210 skeleton
> (verified: zero violations in 100 levels).
>
> **HOW MANY** primes arrive by each layer — governed by the zeta zeros
> through the explicit formula (verified below).

## Setup

Layer `l`'s last block is `B(l) = l(l+1)(2l+1)/6`; these 100 boundaries are
the pyramid's natural checkpoints (apex block count 338,350). We measure
prime mass with Chebyshev's function `ψ(x) = Σ_{pᵏ ≤ x} log p`, computed
exactly from a sieve, and reconstruct it from the zeros with the
von Mangoldt explicit formula truncated to the first `K` zeros
`ρ = ½ + iγ`:

```
ψ₀(x) ≈ x − Σ_{k≤K} 2·Re(x^ρₖ / ρₖ) − log 2π − ½·log(1 − x⁻²)
```

The first 200 zeros (γ₁ = 14.134725…, γ₂₀₀ = 396.381854…) are computed
with mpmath and cached in `zeta_zeros.txt`.

## Result 1 — the staircase is rebuilt from zeros

`renders/staircase_zeta.svg`: over layers 1–7, the smooth term `x` plus 10
correction waves already hugs the exact prime staircase; 200 waves trace
its steps. The primes' positions inside the pyramid are encoded, wave by
wave, in the zeros — exactly the tutorial's claim, drawn on our object.

Explicit-formula check at layer boundaries (`x = B(l) + ½`):

| layer | x | ψ exact | 200-zero formula | error |
|---|---|---|---|---|
| 5 | 55.5 | 53.5 | 53.5 | +0.0 |
| 10 | 385.5 | 385.9 | 385.6 | −0.3 |
| 25 | 5,525.5 | 5,529.3 | 5,525.8 | −3.5 |
| 50 | 42,925.5 | 43,022.2 | 43,036.3 | +14.1 |
| 75 | 143,450.5 | 143,440.0 | 143,489.1 | +49.1 |
| 100 | 338,350.5 | 338,626.7 | 338,543.7 | −82.9 |

Relative error at the apex: 82.9 / 338,626.7 ≈ 0.02%, using only 200 of
the infinitely many zeros.

## Result 2 — the zeros drive the pyramid's error wave

`renders/layer_error_zeta.svg`: plot the normalized error
`(ψ(B) − B)/√B` at all 100 layer boundaries (blue) against the wave
predicted purely by the 200 zeros (orange). The two curves track each
other bump for bump.

- Max normalized error over the 100 checkpoints: **1.225** — comfortably
  RH-sized (`|ψ(x) − x| = O(√x·log²x)` under RH; `log²(338,350) ≈ 162`).
- After subtracting the 200-zero wave, the residual drops to **0.143** —
  the first 200 zeros account for ~88% of the pyramid's prime-count
  fluctuation. Adding more zeros drives it further toward 0.

This is the Riemann Hypothesis as seen from inside the pyramid: the layer
counts wobble around their smooth trend by exactly √x-sized waves, and
those waves are the zeta zeros. If any zero were off the critical line,
one wave in the orange curve would grow like a power of `x` and the two
curves would peel apart lower in the pyramid.

## Result 3 — Law v3: the skeleton is filled uniformly

The modular law said primes live only on the skeleton's residue lanes. The
Dirichlet/GRH refinement says they fill those lanes **evenly**, with
√x-sized fluctuations governed by the zeros of Dirichlet L-functions —
the same mechanism, one L-function per lane. Measured over the whole
pyramid (`renders/residue_equidistribution.svg`):

| skeleton | lanes | mean primes/lane | max deviation from uniform |
|---|---|---|---|
| mod 30 | 8 | 3,633.1 | 0.66% |
| mod 210 | 48 | 605.5 | 2.72% |

> **Prime Pyramid Law v3.** Primes occupy only the modular skeleton
> (v1/v2), they fill its lanes uniformly (v3), and the deviation from
> uniformity at every scale is a superposition of critical-line zero
> waves. The pyramid's prime pattern = skeleton geometry + zeta music.

## Files

- `pyramid_zeta.py` — everything above: zeros (mpmath, cached), exact ψ,
  explicit formula, per-layer error, equidistribution, and the three SVG
  charts. Run `python3 pyramid_zeta.py [levels]`.
- `zeta_zeros.txt` — imaginary parts of the first 200 non-trivial zeros.
- `renders/staircase_zeta.svg`, `renders/layer_error_zeta.svg`,
  `renders/residue_equidistribution.svg`.
