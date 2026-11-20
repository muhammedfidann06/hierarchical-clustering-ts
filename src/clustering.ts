/**
 * Hierarchical Agglomerative Clustering (HAC)
 */

export type Point = number[];
export type Linkage = "single" | "complete" | "average" | "ward";
export type Metric = "euclidean" | "manhattan" | "cosine";

/** Ein Schritt im Dendrogramm: Cluster a und b werden zusammen. */
export interface Merge {
  a: number;
  b: number;
  distance: number;
  size: number;
}

// ---------------------------------------------------------------------------
// Distanz-Funktionen
// ---------------------------------------------------------------------------

// Die normale Distanz (Luftlinie) zwischen zwei Punkten.
export function euclidean(p: Point, q: Point): number {
  let sum = 0;
  for (let i = 0; i < p.length; i++) sum += (p[i] - q[i]) ** 2;
  return Math.sqrt(sum);
}

// Wie ein Taxi in der Stadt: nur gerade Wege.
export function manhattan(p: Point, q: Point): number {
  let sum = 0;
  for (let i = 0; i < p.length; i++) sum += Math.abs(p[i] - q[i]);
  return sum;
}

// Hier ist der Winkel wichtig, nicht die Länge.
export function cosine(p: Point, q: Point): number {
  let dot = 0, np = 0, nq = 0;
  for (let i = 0; i < p.length; i++) {
    dot += p[i] * q[i];
    np += p[i] ** 2;
    nq += q[i] ** 2;
  }
  if (np === 0 || nq === 0) return 1;
  return 1 - dot / (Math.sqrt(np) * Math.sqrt(nq));
}

const METRICS: Record<Metric, (p: Point, q: Point) => number> = {
  euclidean,
  manhattan,
  cosine,
};

// Wir berechnen alle Distanzen einmal und speichern sie in einer Matrix.
export function distanceMatrix(points: Point[], metric: Metric = "euclidean"): number[][] {
  const f = METRICS[metric];
  const n = points.length;
  const d: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      d[i][j] = d[j][i] = f(points[i], points[j]);
    }
  }
  return d;
}

// ---------------------------------------------------------------------------
// Lance-Williams-Formel
// ---------------------------------------------------------------------------
// Mit dieser Formel rechnen wir die neue Distanz schnell aus.
// Wir müssen nicht alle Punkte noch einmal ansehen.
function lanceWilliams(
  linkage: Linkage,
  dik: number,
  djk: number,
  dij: number,
  ni: number,
  nj: number,
  nk: number,
): number {
  switch (linkage) {
    case "single":
      return Math.min(dik, djk); // Der kleinste Abstand zählt.
    case "complete":
      return Math.max(dik, djk); // Der größte Abstand zählt.
    case "average":
      return (ni * dik + nj * djk) / (ni + nj); // Der Mittelwert zählt.
    case "ward": {
      // Ward: Die Varianz im Cluster soll klein bleiben.
      const t = ni + nj + nk;
      return Math.sqrt(
        ((ni + nk) * dik ** 2 + (nj + nk) * djk ** 2 - nk * dij ** 2) / t,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Der Algorithmus
// ---------------------------------------------------------------------------
export interface HacOptions {
  linkage?: Linkage;
  metric?: Metric;
}

/**
 * Gibt eine Liste von Merges zurück (wie scipy "linkage").
 * Neue Cluster bekommen die IDs n, n+1, n+2, ...
 */
export function agglomerate(points: Point[], opts: HacOptions = {}): Merge[] {
  const linkage = opts.linkage ?? "average";
  const metric = opts.metric ?? "euclidean";
  if (linkage === "ward" && metric !== "euclidean") {
    throw new Error("Ward funktioniert nur mit euklidischer Distanz.");
  }

  const n = points.length;
  const d = distanceMatrix(points, metric);

  // Am Anfang ist jeder Punkt ein eigener Cluster.
  const active = new Set<number>(Array.from({ length: n }, (_, i) => i));
  const size = new Array(n).fill(1);
  const id = Array.from({ length: n }, (_, i) => i); // Index -> Cluster-ID
  const merges: Merge[] = [];
  let nextId = n;

  // Solange es mehr als einen Cluster gibt, machen wir weiter.
  while (active.size > 1) {
    // 1) Wir suchen die zwei nächsten Cluster.
    let bi = -1, bj = -1, best = Infinity;
    const list = [...active];
    for (let x = 0; x < list.length; x++) {
      for (let y = x + 1; y < list.length; y++) {
        const i = list[x], j = list[y];
        if (d[i][j] < best) {
          best = d[i][j];
          bi = i;
          bj = j;
        }
      }
    }

    // 2) Wir speichern den Schritt.
    const newSize = size[bi] + size[bj];
    merges.push({
      a: Math.min(id[bi], id[bj]),
      b: Math.max(id[bi], id[bj]),
      distance: best,
      size: newSize,
    });

    // 3) Wir rechnen die Distanzen für den neuen Cluster neu.
    //    Der neue Cluster wohnt jetzt im Index "bi".
    for (const k of active) {
      if (k === bi || k === bj) continue;
      const v = lanceWilliams(linkage, d[bi][k], d[bj][k], best, size[bi], size[bj], size[k]);
      d[bi][k] = d[k][bi] = v;
    }
    size[bi] = newSize;
    id[bi] = nextId++;
    active.delete(bj); // Cluster bj gibt es nicht mehr.
  }
  return merges;
}

/**
 * Wir schneiden das Dendrogramm, bis wir k Cluster haben.
 * Rückgabe: ein Label (0..k-1) für jeden Punkt.
 */
export function cutTree(merges: Merge[], n: number, k: number): number[] {
  if (k < 1 || k > n) throw new Error("k muss zwischen 1 und n sein.");

  // Union-Find: Wir merken uns, wer zu wem gehört.
  const parent = Array.from({ length: 2 * n }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));

  // Wir machen nur die ersten (n - k) Merges.
  for (let s = 0; s < n - k; s++) {
    const m = merges[s];
    const newId = n + s;
    parent[find(m.a)] = newId;
    parent[find(m.b)] = newId;
  }

  // Jetzt geben wir jedem Cluster eine schöne Nummer.
  const labels: number[] = [];
  const map = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!map.has(root)) map.set(root, map.size);
    labels.push(map.get(root)!);
  }
  return labels;
}

// ---------------------------------------------------------------------------
// Qualität: Silhouette-Koeffizient
// ---------------------------------------------------------------------------
// Ein Wert nahe 1 ist gut. Ein Wert nahe 0 oder negativ ist schlecht.
export function silhouette(points: Point[], labels: number[], metric: Metric = "euclidean"): number {
  const d = distanceMatrix(points, metric);
  const n = points.length;
  const clusters = new Set(labels);
  if (clusters.size < 2) return 0;

  let total = 0;
  for (let i = 0; i < n; i++) {
    // a = mittlere Distanz im eigenen Cluster
    // b = mittlere Distanz zum nächsten anderen Cluster
    const sums = new Map<number, { s: number; c: number }>();
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const e = sums.get(labels[j]) ?? { s: 0, c: 0 };
      e.s += d[i][j];
      e.c += 1;
      sums.set(labels[j], e);
    }
    const own = sums.get(labels[i]);
    if (!own) continue; // Allein im Cluster: Wert ist 0.
    const a = own.s / own.c;
    let b = Infinity;
    for (const [lab, e] of sums) if (lab !== labels[i]) b = Math.min(b, e.s / e.c);
    total += (b - a) / Math.max(a, b);
  }
  return total / n;
}
