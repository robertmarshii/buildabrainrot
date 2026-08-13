#!/usr/bin/env python3
"""Prime Pyramid meets the Riemann zeta function.

Builds on prime_pyramid_law.py (the modular skeleton laws) and on the
narrative of DataCamp's "Claude Tried the Riemann Hypothesis" tutorial:
the non-trivial zeros of the zeta function act as correction waves that
control the error term in prime counting. Here we make that concrete on
the square-based pyramid:

  * the modular law (mod 30 / mod 210) says WHERE primes may sit
    (deterministic skeleton, verified: zero violations);
  * the zeta zeros say HOW MANY primes land in each layer
    (analytic law, tested here via the von Mangoldt explicit formula).

The pyramid's layer boundaries B(l) = l(l+1)(2l+1)/6 (last block of
layer l) are used as natural checkpoints:

  1. compute Chebyshev's psi(x) exactly from a sieve;
  2. reconstruct it with the explicit formula
         psi0(x) = x - sum_rho 2*Re(x^rho / rho) - log(2*pi)
                   - 0.5*log(1 - x^-2)
     truncated to the first K zeros rho = 1/2 + i*gamma;
  3. check the RH-sized error |psi(x) - x| / sqrt(x) at every layer
     boundary, and show the zero-sum reproduces that error wave;
  4. test equidistribution of primes across the skeleton's residue
     classes (the GRH-flavored refinement of the modular law).

Zeros are computed with mpmath (pip install mpmath) and cached in
zeta_zeros.txt so re-runs and offline runs need no dependency.

Usage:  python3 pyramid_zeta.py [levels]   (default 100)
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ZEROS_FILE = os.path.join(HERE, "zeta_zeros.txt")
N_ZEROS = 200

# ---------------------------------------------------------------- pyramid

def blocks_through(l):
    """B(l): number of the last block of layer l."""
    return l * (l + 1) * (2 * l + 1) // 6

# ---------------------------------------------------------------- zeros

def load_zeros(n=N_ZEROS):
    if os.path.exists(ZEROS_FILE):
        with open(ZEROS_FILE) as f:
            zs = [float(line) for line in f if line.strip()]
        if len(zs) >= n:
            return zs[:n]
    from mpmath import mp, zetazero
    mp.dps = 20
    zs = [float(zetazero(k).imag) for k in range(1, n + 1)]
    with open(ZEROS_FILE, "w") as f:
        f.writelines(f"{g:.15f}\n" for g in zs)
    return zs

# ---------------------------------------------------------------- psi

def mangoldt_prefix(n):
    """Prefix sums of the von Mangoldt function: psi(x) = P[floor(x)]."""
    is_p = bytearray([1]) * (n + 1)
    is_p[0:2] = b"\x00\x00"
    i = 2
    while i * i <= n:
        if is_p[i]:
            is_p[i * i :: i] = b"\x00" * len(range(i * i, n + 1, i))
        i += 1
    lam = [0.0] * (n + 1)
    for p in range(2, n + 1):
        if is_p[p]:
            lp = math.log(p)
            q = p
            while q <= n:
                lam[q] = lp
                q *= p
    P = [0.0] * (n + 1)
    acc = 0.0
    for k in range(1, n + 1):
        acc += lam[k]
        P[k] = acc
    return P, is_p


def psi_explicit(x, gammas):
    """Truncated von Mangoldt explicit formula with zeros 1/2 + i*gamma."""
    if x <= 1:
        return 0.0
    lx = math.log(x)
    sq = math.sqrt(x)
    s = 0.0
    for g in gammas:
        # 2*Re(x^rho / rho), rho = 1/2 + i*gamma
        re, im = 0.5, g
        mod2 = re * re + im * im
        c, sn = math.cos(g * lx), math.sin(g * lx)
        s += 2 * sq * (c * re + sn * im) / mod2
    return x - s - math.log(2 * math.pi) - 0.5 * math.log(1 - x ** -2)

# ---------------------------------------------------------------- svg

SURFACE = "#fcfcfb"
INK = "#0b0b0b"
INK2 = "#52514e"
MUTED = "#898781"
GRID = "#e1e0d9"
BASE = "#c3c2b7"
S1, S2, S3 = "#2a78d6", "#eb6834", "#1baf7a"   # categorical slots 1..3
FONT = 'font-family="system-ui, -apple-system, Segoe UI, sans-serif"'


class Chart:
    def __init__(self, w, h, title, subtitle):
        self.w, self.h = w, h
        self.parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">',
            f'<rect width="{w}" height="{h}" fill="{SURFACE}"/>',
            f'<text x="20" y="28" {FONT} font-size="15" font-weight="600" '
            f'fill="{INK}">{title}</text>',
            f'<text x="20" y="46" {FONT} font-size="12" '
            f'fill="{INK2}">{subtitle}</text>',
        ]

    def add(self, s):
        self.parts.append(s)

    def text(self, x, y, s, size=11, fill=MUTED, anchor="middle", weight="400",
             tabular=False):
        extra = ' style="font-variant-numeric: tabular-nums"' if tabular else ""
        self.add(
            f'<text x="{x:.1f}" y="{y:.1f}" {FONT} font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}"{extra}>{s}</text>'
        )

    def save(self, name):
        self.add("</svg>")
        path = os.path.join(HERE, "renders", name)
        with open(path, "w") as f:
            f.write("\n".join(self.parts))
        return path


def nice_ticks(lo, hi, n=5):
    span = hi - lo
    step = 10 ** math.floor(math.log10(span / n))
    for m in (1, 2, 2.5, 5, 10):
        if span / (step * m) <= n:
            step *= m
            break
    t0 = math.ceil(lo / step) * step
    ticks = []
    t = t0
    while t <= hi + 1e-9:
        ticks.append(round(t, 10))
        t += step
    return ticks


class Frame:
    """A plot area with linear scales, gridlines, and axis labels."""

    def __init__(self, ch, x0, y0, x1, y1, xlim, ylim, xticks=None, yticks=None,
                 xfmt=lambda v: f"{v:g}", yfmt=lambda v: f"{v:g}"):
        self.ch, self.x0, self.y0, self.x1, self.y1 = ch, x0, y0, x1, y1
        self.xlim, self.ylim = xlim, ylim
        for v in (yticks if yticks is not None else nice_ticks(*ylim)):
            y = self.Y(v)
            ch.add(f'<line x1="{x0}" y1="{y:.1f}" x2="{x1}" y2="{y:.1f}" '
                   f'stroke="{GRID}" stroke-width="1"/>')
            ch.text(x0 - 8, y + 4, yfmt(v), anchor="end", tabular=True)
        for v in (xticks if xticks is not None else nice_ticks(*xlim)):
            x = self.X(v)
            ch.text(x, y1 + 18, xfmt(v), tabular=True)
        ch.add(f'<line x1="{x0}" y1="{y1}" x2="{x1}" y2="{y1}" '
               f'stroke="{BASE}" stroke-width="1"/>')

    def X(self, v):
        a, b = self.xlim
        return self.x0 + (v - a) / (b - a) * (self.x1 - self.x0)

    def Y(self, v):
        a, b = self.ylim
        return self.y1 - (v - a) / (b - a) * (self.y1 - self.y0)

    def polyline(self, pts, color, width=2, dash=None):
        d = " ".join(f"{self.X(x):.1f},{self.Y(y):.1f}" for x, y in pts)
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        self.ch.add(f'<polyline points="{d}" fill="none" stroke="{color}" '
                    f'stroke-width="{width}" stroke-linejoin="round"'
                    f'{dash_attr}/>')


def legend(ch, x, y, entries):
    for label, color in entries:
        ch.add(f'<circle cx="{x}" cy="{y - 4}" r="4" fill="{color}"/>')
        ch.text(x + 10, y, label, fill=INK2, anchor="start")
        x += 10 + 7 * len(label) + 26

# ---------------------------------------------------------------- charts

def chart_staircase(P, gammas):
    lo, hi = 2.0, 150.0
    ch = Chart(840, 440, "The prime staircase, rebuilt from zeta zeros",
               "Chebyshev &#968;(x) across pyramid layers 1&#8211;7 vs the "
               "explicit formula truncated to 10 and 200 zeros")
    boundaries = [blocks_through(l) for l in range(1, 8)
                  if lo <= blocks_through(l) <= hi]
    fr = Frame(ch, 70, 70, 810, 380, (lo, hi), (0, 160),
               xticks=boundaries, xfmt=lambda v: f"{int(v)}")
    ch.text(440, 425, "block number x (ticks = last block of each layer)",
            fill=MUTED)
    for b in boundaries:
        x = fr.X(b)
        ch.add(f'<line x1="{x:.1f}" y1="70" x2="{x:.1f}" y2="380" '
               f'stroke="{GRID}" stroke-width="1" stroke-dasharray="2,4"/>')
    grid = [lo + i * 0.25 for i in range(int((hi - lo) / 0.25) + 1)]
    fr.polyline([(x, psi_explicit(x, gammas[:10])) for x in grid], S2)
    # exact psi as a true staircase
    steps = [(lo, P[int(lo)])]
    for n in range(int(lo) + 1, int(hi) + 1):
        if P[n] != P[n - 1]:
            steps += [(n, P[n - 1]), (n, P[n])]
    steps.append((hi, P[int(hi)]))
    fr.polyline(steps, S1)
    # 200-zero curve hugs the exact staircase — dash it on top so both show
    fr.polyline([(x, psi_explicit(x, gammas)) for x in grid], S3, dash="6,4")
    legend(ch, 70, 62, [("exact &#968;(x)", S1), ("10 zeros", S2),
                        ("200 zeros", S3)])
    ch.text(fr.X(144), fr.Y(P[144]) - 22, "exact", fill=S1, weight="600")
    ch.text(fr.X(100), fr.Y(psi_explicit(100, gammas[:10])) + 22, "10 zeros",
            fill=S2, weight="600")
    ch.text(fr.X(52), fr.Y(psi_explicit(52, gammas)) - 14, "200 zeros",
            fill=S3, weight="600")
    return ch.save("staircase_zeta.svg")


def chart_layer_error(P, gammas, levels):
    ch = Chart(840, 440, "Zeta zeros drive the pyramid&#8217;s error wave",
               "Normalized prime-counting error (&#968;(B)&#8722;B)/&#8730;B at each "
               "layer boundary, vs the wave predicted by 200 zeros")
    xs = list(range(1, levels + 1))
    actual, predicted = [], []
    for l in xs:
        b = blocks_through(l)
        x = b + 0.5                       # between blocks: psi0 = psi there
        actual.append((P[b] - x) / math.sqrt(x))
        predicted.append((psi_explicit(x, gammas) - x) / math.sqrt(x))
    lo = min(min(actual), min(predicted)) - 0.2
    hi = max(max(actual), max(predicted)) + 0.2
    fr = Frame(ch, 70, 70, 730, 380, (1, levels), (lo, hi),
               xticks=list(range(10, levels + 1, 10)),
               yfmt=lambda v: f"{v:+.1f}")
    y0 = fr.Y(0)
    ch.add(f'<line x1="70" y1="{y0:.1f}" x2="730" y2="{y0:.1f}" '
           f'stroke="{BASE}" stroke-width="1" stroke-dasharray="4,3"/>')
    fr.polyline(list(zip(xs, predicted)), S2)
    fr.polyline(list(zip(xs, actual)), S1)
    legend(ch, 70, 62, [("actual error", S1), ("200-zero prediction", S2)])
    ch.text(400, 425, "pyramid layer l  (checkpoint x = last block of layer l)",
            fill=MUTED)
    ya, yp = fr.Y(actual[-1]), fr.Y(predicted[-1])
    if abs(ya - yp) < 16:                     # keep end labels from colliding
        mid = (ya + yp) / 2
        ya, yp = (mid - 8, mid + 8) if ya <= yp else (mid + 8, mid - 8)
    ch.text(738, ya + 4, "actual", fill=S1, weight="600", anchor="start")
    ch.text(738, yp + 4, "prediction", fill=S2, weight="600", anchor="start")
    return ch.save("layer_error_zeta.svg")


def chart_residue_bars(counts):
    ch = Chart(840, 400, "Primes fill the mod-30 skeleton uniformly",
               "Primes &#8804; 338,350 per allowed residue class "
               "(dashed line = exact uniform share)")
    residues = sorted(counts)
    hi = max(counts.values()) * 1.15
    fr = Frame(ch, 70, 70, 810, 330, (0, len(residues)), (0, hi),
               xticks=[], yticks=nice_ticks(0, hi, 4),
               yfmt=lambda v: f"{int(v):,}")
    mean = sum(counts.values()) / len(residues)
    band = (810 - 70) / len(residues)
    for i, r in enumerate(residues):
        x = 70 + i * band + band * 0.18
        w = band * 0.64
        y = fr.Y(counts[r])
        h = 330 - y
        ch.add(f'<path d="M{x:.1f},{y + 4:.1f} q0,-4 4,-4 h{w - 8:.1f} '
               f'q4,0 4,4 v{h - 4:.1f} h-{w:.1f} Z" fill="{S1}"/>')
        ch.text(x + w / 2, y - 8, f"{counts[r]:,}", fill=INK2, tabular=True)
        ch.text(x + w / 2, 348, f"{r}", fill=MUTED, tabular=True)
    ym = fr.Y(mean)
    ch.add(f'<line x1="70" y1="{ym:.1f}" x2="810" y2="{ym:.1f}" '
           f'stroke="{INK2}" stroke-width="1" stroke-dasharray="4,3"/>')
    ch.text(74, ym - 8, f"uniform = {mean:,.0f}", fill=INK2, anchor="start")
    ch.text(440, 372, "residue class mod 30 (the 8 lanes of the skeleton)",
            fill=MUTED)
    return ch.save("residue_equidistribution.svg")

# ---------------------------------------------------------------- main

def main():
    levels = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    total = blocks_through(levels)
    print(f"Pyramid: {levels} levels, blocks 1..{total}")
    print(f"Loading first {N_ZEROS} non-trivial zeta zeros "
          f"(1/2 + i*gamma) ...")
    gammas = load_zeros()
    print(f"  gamma_1 = {gammas[0]:.6f}, gamma_{N_ZEROS} = {gammas[-1]:.6f}\n")

    P, is_p = mangoldt_prefix(total)

    print("--- Explicit formula at layer boundaries (x = last block + 1/2) ---")
    print(f"{'layer':>5} {'x':>9} {'psi exact':>12} {'200 zeros':>12} "
          f"{'error':>8}")
    sample = [l for l in (5, 10, 25, 50, 75, 100) if l <= levels]
    for l in sample:
        b = blocks_through(l)
        x = b + 0.5
        exact = P[b]
        approx = psi_explicit(x, gammas)
        print(f"{l:>5} {x:>9.1f} {exact:>12.1f} {approx:>12.1f} "
              f"{approx - exact:>+8.1f}")

    print("\n--- RH-sized error check at all layer boundaries ---")
    worst = max(
        abs(P[blocks_through(l)] - (blocks_through(l) + 0.5))
        / math.sqrt(blocks_through(l) + 0.5)
        for l in range(1, levels + 1)
    )
    resid = []
    for l in range(1, levels + 1):
        b = blocks_through(l)
        x = b + 0.5
        resid.append(abs(P[b] - psi_explicit(x, gammas)) / math.sqrt(x))
    print(f"  max |psi(x)-x|/sqrt(x) over {levels} checkpoints: {worst:.3f}")
    print(f"  (RH predicts this stays O(log^2 x); log^2 of the apex block "
          f"count is {math.log(total)**2:.0f})")
    print(f"  after subtracting the 200-zero wave the residue drops to "
          f"max {max(resid):.3f}")

    print("\n--- Equidistribution across the skeleton (Law v3 candidate) ---")
    counts30 = {}
    counts210 = {}
    for n in range(11, total + 1):     # primes > 7 (skeleton primes for both)
        if is_p[n]:
            counts30[n % 30] = counts30.get(n % 30, 0) + 1
            counts210[n % 210] = counts210.get(n % 210, 0) + 1
    for m, cs in ((30, counts30), (210, counts210)):
        mean = sum(cs.values()) / len(cs)
        dev = max(abs(v - mean) / mean for v in cs.values())
        print(f"  mod {m:>3}: {len(cs)} classes, mean {mean:,.1f} "
              f"primes/class, max deviation {dev:.2%}")

    os.makedirs(os.path.join(HERE, "renders"), exist_ok=True)
    print("\n--- Rendering charts ---")
    for path in (chart_staircase(P, gammas),
                 chart_layer_error(P, gammas, levels),
                 chart_residue_bars(counts30)):
        print(f"  wrote {os.path.relpath(path)}")

    print("\nRESULT: the modular skeleton says WHERE primes may sit;")
    print("the zeta zeros reproduce HOW MANY arrive by each layer.")


if __name__ == "__main__":
    main()
