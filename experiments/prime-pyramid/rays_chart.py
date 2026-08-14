#!/usr/bin/env python3
"""Scatter chart: actual primes per ray vs Hardy-Littlewood prediction.

Reads rays_results.tsv (written by rays_hardy_littlewood.py) and renders
renders/rays_vs_hl.svg. Generic rays only - Bateman-Horn does not apply
to reducible rays (their prediction is 'finitely many', observed: 0).
"""

import os

from pyramid_zeta import Chart, Frame, S1, INK2, MUTED, nice_ticks

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    rows = []
    with open(os.path.join(HERE, "rays_results.tsv")) as fh:
        next(fh)
        for line in fh:
            fam, u, v, cls, C, A, E, z = line.rstrip("\n").split("\t")
            if cls == "generic":
                rows.append((f"{fam}({u},{v})", int(A), float(E), float(z)))
    hi = max(max(a for _, a, _, _ in rows), max(e for _, _, e, _ in rows))
    hi *= 1.08
    ch = Chart(560, 560, "Pyramid rays obey Hardy&#8211;Littlewood",
               f"{len(rows)} generic rays, layers 12&#8211;500: actual "
               "primes vs C(f)&#183;&#931;1/ln f(n)")
    fr = Frame(ch, 70, 70, 530, 490, (0, hi), (0, hi),
               xticks=nice_ticks(0, hi, 5), yticks=nice_ticks(0, hi, 5))
    ch.add(f'<line x1="{fr.X(0):.1f}" y1="{fr.Y(0):.1f}" '
           f'x2="{fr.X(hi):.1f}" y2="{fr.Y(hi):.1f}" stroke="{INK2}" '
           f'stroke-width="1" stroke-dasharray="5,4"/>')
    ch.text(fr.X(hi * 0.94), fr.Y(hi * 0.94) - 10, "y = x", fill=INK2)
    for name, a, e, z in rows:
        ch.add(f'<circle cx="{fr.X(e):.1f}" cy="{fr.Y(a):.1f}" r="3.5" '
               f'fill="{S1}" fill-opacity="0.55"/>')
    ch.text(300, 528, "Hardy&#8211;Littlewood predicted primes on ray",
            fill=MUTED)
    ch.add(f'<text x="24" y="280" font-family="system-ui, sans-serif" '
           f'font-size="11" fill="{MUTED}" text-anchor="middle" '
           f'transform="rotate(-90 24 280)">actual primes on ray</text>')
    path = ch.save("rays_vs_hl.svg")
    print(f"wrote {os.path.relpath(path)}")


if __name__ == "__main__":
    main()
