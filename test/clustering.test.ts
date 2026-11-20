// Tests mit dem eingebauten Test-Runner von Node.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import { agglomerate, cutTree, euclidean, manhattan, silhouette } from "../src/clustering";

// Zwei klare Gruppen: links unten und rechts oben.
const pts = [
  [0, 0], [0, 1], [1, 0],
  [10, 10], [10, 11], [11, 10],
];

test("Distanzen sind richtig", () => {
  assert.equal(euclidean([0, 0], [3, 4]), 5);
  assert.equal(manhattan([0, 0], [3, 4]), 7);
});

test("es gibt n-1 Merges", () => {
  assert.equal(agglomerate(pts).length, pts.length - 1);
});

test("zwei Gruppen werden gefunden", () => {
  for (const linkage of ["single", "complete", "average", "ward"] as const) {
    const labels = cutTree(agglomerate(pts, { linkage }), pts.length, 2);
    // Die ersten drei Punkte sind zusammen, die letzten drei auch.
    assert.equal(new Set(labels.slice(0, 3)).size, 1);
    assert.equal(new Set(labels.slice(3)).size, 1);
    assert.notEqual(labels[0], labels[3]);
  }
});

test("Distanzen im Dendrogramm wachsen (single linkage)", () => {
  const d = agglomerate(pts, { linkage: "single" }).map((m) => m.distance);
  for (let i = 1; i < d.length; i++) assert.ok(d[i] >= d[i - 1]);
});

test("Silhouette ist hoch für klare Gruppen", () => {
  const labels = cutTree(agglomerate(pts), pts.length, 2);
  assert.ok(silhouette(pts, labels) > 0.8);
});
