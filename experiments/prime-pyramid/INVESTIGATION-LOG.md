# Prime Pyramid Investigation — Experiment Log

Companion to the investigation document (fail-fast protocol: every
hypothesis gets the cheapest decisive test first; rules are frozen before
validation on unseen regions). Population throughout: **wheel survivors**
(blocks coprime to the baseline wheel), labelled *prime* vs *composite
survivor* — the doc's category-2-vs-3 comparison.

## Corrections to the investigation document

- mod-210 survivors in the 100-layer pyramid: **77,337**, not 77,340
  (77,341 counting 2, 3, 5, 7 themselves); composite survivors **48,272**.
- "Every prime was contained in the 210 candidate set" needs the
  qualifier *greater than 7* (2, 3, 5, 7 are not coprime to 210).
- All other headline numbers verified exactly: 91 / 385 / 338,350 blocks,
  76 primes at 10 layers, 29,069 at 100, layer-8 survivors
  {143, 169, 187} composite + 12 primes.

## Experiment A — three-layer slices

`slice_explorer.py` renders any centre layer ±1 with the three categories
(rejected / composite survivor / prime). Renders in `renders/slice_*.png`
for centres 8, 12, 15, 18, 20, 40, 60, 80, 99. Prime share among
survivors falls 82% → 35% from layer 8 to 100 — every statistical test
below stratifies by layer because of this gradient.

## Experiment B — within-layer lattice screen (killed, instructively)

`feature_screen.py`: 44 features (r, c, r±c mod k, k = 2..12) on wheel
survivors; discovery layers 8–50, validation 51–100; layer-stratified
chi-square + within-layer permutation tests; control re-screen with the
wheel extended to 30030 = 2·3·5·7·11·13.

Findings, in fail-fast order:

1. **Naive (unstratified) screening is confounded** — the depth gradient
   masquerades as feature signal. Fixed by stratification.
2. **(r−c) mod 11 replicated strongly under wheel 210 and died under
   wheel 30030** — divisibility by 11 leaking through the congruence
   channel `r − c ≡ N (mod m)` in layers with m | n+1. As predicted.
3. In layers with 11 | n, the column class hitting N ≡ 0 (mod 11) holds
   **0 primes** in every tested layer (22, 44, 66, 88) — the doc's
   final-column rule generalised: it is a *column wipeout*, `q | n`.
4. One survivor: **(r−c) mod 12** replicated under wheel 30030 and beat
   1000 within-layer permutations (p = 0.001). Localisation: a **mod-3**
   phenomenon (mod 4 is noise), concentrated in a z = −6.2 depletion of
   class r ≡ c, replicating in every split — and, decisively, living in
   layers with **no** congruence channel to 12. The Chebyshev-bias
   explanation was refuted (flat number-line rates, no (r+c) mirror).

## The wipeout laws (Experiment B resolution — proven and verified)

`diagonal_wipeout.py`. Within layer n, the three natural line families
are arithmetic progressions: rows step 1, columns step n, diagonals step
n+1, anti-diagonals step n−1. Any prime q dividing the step pins the
whole line to one residue class mod q. Combined with the identity
`B(n) ≡ −1 (mod q)` whenever `n ≡ −1 (mod q)` and q ≥ 5:

> **Main-diagonal theorem.** For every prime q ≥ 5 dividing n+1, every
> block on the main diagonal (r = c) of layer n is divisible by q.
> Verified: 70 of the first 100 layers qualify, 0 counterexamples.
> Corollary: whenever n+1 has any prime factor ≥ 5, the main diagonal of
> layer n contains no primes at all.

The doc's Section-9 rule (last column of prime-indexed layer p divisible
by p) is the q | n case of the same family; q | n−1 wipes one
anti-diagonal class (s ≡ −1 mod q).

Removing the predicted wiped cells (1,550 cells in the clean subset —
containing **0 primes**, as the law requires) collapses the mod-12
anomaly completely: chi² 58.6 → 13.7 (p = 0.25), mod 3: 15.8 → 2.1.
**Every within-layer signal found so far is now explained by moving
modular lattices — no residual geometric information.**

## Experiment C — the 11–19 slab (doc secs. 17–21)

`slab_analysis.py`: wheel-30030 survivors; translation rules (dr, dc) ∈
[−3, 3]² between consecutive layers and 3D line slopes through three
layers; within-layer shuffle null with max-statistic correction; rules
frozen on 11–19 and validated untouched on slabs 29–37 and 41–49.

- Discovery slab: best translation z = +2.65, **max-corrected p = 1.0**
  — indistinguishable from chance among 49 tested rules. No prime
  3-in-a-line triples exist at all in the slab.
- Frozen rules on validation slabs: combined p = 0.026 / 0.032 — but the
  follow-up showed the entire rule field is mildly elevated (mean z
  +0.12 / +0.22, ~60% of rules positive) and **no rule survives
  max-correction within the validation slabs** (p = 0.80 / 0.29). The
  lift is direction-nonspecific, consistent with the residue-sharing
  channel: cells with N′ ≡ N (mod q), q > 13, escape or fail q together,
  which the shuffle null erases. Not a geometric law.
- Hits split by target-layer type ∝ layer counts: **no prime-indexed
  layer specialness in 3D** (doc sec. 20 → Outcome 2).

## Where this leaves the investigation

The doc's central question — after controlling for divisibility, do
primes occupy geometry that composite survivors do not? — has been
answered **no** at every scale tested, with each apparent signal traced
to a named arithmetic mechanism (depth gradient, congruence-channel
leakage, wipeout laws, residue sharing). The positive yield: the pyramid
made three exact structural laws visible (column / diagonal /
anti-diagonal wipeouts) that are genuinely geometric *statements about
composites*, plus a fully characterised moving-lattice scaffold.

**Most promising open direction** (not yet run): rays through the
pyramid are integer polynomials in the layer index (cubic from B(n)).
Prime-rich rays = prime-rich polynomials, where the Hardy–Littlewood
constants make quantitative predictions. Ranking the pyramid's rays by
prime density against those predictions — and hunting for rays that beat
them — is the one place a surprise could still live.

## Scripts

| file | purpose |
|---|---|
| `slice_explorer.py` | 3-layer category renders |
| `feature_screen.py` | stratified + permutation feature screen, wheel control |
| `decompose_mod12.py` | leak-split / number-line / mirror decomposition |
| `mod12_deep_dive.py` | permutation, localisation, split-half replication |
| `diagonal_wipeout.py` | wipeout mechanism test + main-diagonal theorem |
| `slab_analysis.py` | 11–19 slab, frozen-rule validation on 29–37, 41–49 |

## Experiment D — rays vs Hardy–Littlewood (the attunement target)

`rays_hardy_littlewood.py`, `rays_chart.py`. A ray fixes (r, c) relative
to a corner and descends the layers, making the block number an integer
cubic in n: TL(r0,c0): N = B(n) + r0·n + c0 + 1; BR(a,b):
N = B(n) + n² − an − b (r = n−1−a, c = n−1−b). 200 rays, layers 12–500
(pyramid sieved to 41,791,750 blocks). For each ray the Bateman–Horn /
Hardy–Littlewood constant C(f) = Π_p (1−ω_p/p)/(1−1/p) was computed by
root-counting mod p (p ≤ 3000; exact densities over a period-36 window
for p = 2, 3), giving the prediction E = C(f)·Σ 1/ln f(n).

Two bugs were caught by their own signatures before trusting a verdict:
a period-aliasing error in the p = 2, 3 densities (f mod 2 has period 4,
f mod 3 period 9 — a 6-window aliases both), and a missed residue-class
credit for p = 5, 7 < offset range (every cold ray had v ≥ 7, every hot
ray v ≤ 4 — the constants, not the primes, were wrong).

Final results:

- **51 rays are algebraically reducible** (rational root in the cubic)
  and are predicted eventually prime-free: observed **0 primes on all
  51**, layers 12–500. This includes the first-block ray B(n)+1
  (root n = −1) and the last-block ray B(n+1) = n(n+1)(2n+1)/6.
- **149 generic rays**: 6,680 primes observed vs 6,719.7 predicted —
  **ratio 0.994 ± 0.012**, mean z = −0.03, max |z| = 1.77 against an
  expected-max ≈ 3.2 for 149 rays. No ray beats its constant.
  (`renders/rays_vs_hl.svg`.)

Verdict: ray-by-ray, the pyramid's prime-rich and prime-poor directions
are **fully predicted by the Hardy–Littlewood constants** — down to
sub-percent aggregate accuracy. The pyramid contains no directional
prime information beyond what the constants already encode. Combined
with Experiments A–C, the investigation's answer is now complete: every
geometric prime pattern in the square-based pyramid is accounted for by
(i) the moving modular lattices, (ii) the wipeout laws, and (iii) the
Hardy–Littlewood ray constants. The pyramid is a faithful geometric
window onto known prime arithmetic — and an honest null on everything
beyond it, at every scale we could test.
