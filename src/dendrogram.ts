import { Merge } from "./clustering";

// Sonderzeichen für XML ersetzen. Sonst macht ein Label wie "R&D" oder "A<B" das SVG kaputt.
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wir zeichnen das Dendrogramm als SVG-Bild.
 */
export function dendrogramSvg(
  merges: Merge[],
  n: number,
  labels: string[] = [],
  width = 640,
  height = 360,
): string {
  const pad = 30;
  const maxD = Math.max(...merges.map((m) => m.distance), 1e-9);

  // Zuerst suchen wir die Reihenfolge der Blätter (von links nach rechts).
  const children = new Map<number, [number, number]>();
  merges.forEach((m, i) => children.set(n + i, [m.a, m.b]));
  const order: number[] = [];
  const walk = (node: number): void => {
    const c = children.get(node);
    if (!c) order.push(node);
    else {
      walk(c[0]);
      walk(c[1]);
    }
  };
  walk(n + merges.length - 1);

  // Jedes Blatt bekommt eine x-Position.
  const step = (width - 2 * pad) / Math.max(n - 1, 1);
  const x = new Map<number, number>();
  const y = new Map<number, number>();
  order.forEach((leaf, i) => {
    x.set(leaf, pad + i * step);
    y.set(leaf, height - pad);
  });

  // Die Höhe zeigt die Distanz.
  const yOf = (dist: number) => height - pad - (dist / maxD) * (height - 2 * pad);

  const lines: string[] = [];
  merges.forEach((m, i) => {
    const node = n + i;
    const xa = x.get(m.a)!, xb = x.get(m.b)!;
    const ya = y.get(m.a)!, yb = y.get(m.b)!;
    const yn = yOf(m.distance);
    // Eine Klammer-Form: zwei Linien nach oben, eine Linie quer.
    lines.push(`<path d="M${xa},${ya}V${yn}H${xb}V${yb}" />`);
    x.set(node, (xa + xb) / 2);
    y.set(node, yn);
  });

  const text = order
    .map((leaf) => `<text x="${x.get(leaf)}" y="${height - 10}">${escapeXml(String(labels[leaf] ?? leaf))}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<g fill="none" stroke="#3b82f6" stroke-width="1.5">${lines.join("")}</g>
<g font-size="10" text-anchor="middle" font-family="sans-serif">${text}</g>
</svg>`;
}
