import { test } from "node:test";
import assert from "node:assert/strict";
import { bestK, type Point } from "../src/clustering";

// Drei klar getrennte Gruppen um (0,0), (10,0) und (0,10)
function threeBlobs(): Point[] {
  const centers: Point[] = [[0, 0], [10, 0], [0, 10]];
  const offsets: Point[] = [[0, 0], [0.5, 0.2], [-0.3, 0.4], [0.2, -0.5], [-0.4, -0.3]];
  return centers.flatMap(([cx, cy]) => offsets.map(([dx, dy]) => [cx + dx, cy + dy]));
}

test("bestK findet drei Gruppen", () => {
  const result = bestK(threeBlobs(), { linkage: "average", maxK: 6 });
  assert.equal(result.k, 3);
  assert.ok(result.score > 0.8, `Silhouette ${result.score}`);
  assert.equal(result.scores.length, 5); // k = 2 … 6
});

test("bestK funktioniert auch mit Ward", () => {
  assert.equal(bestK(threeBlobs(), { linkage: "ward" }).k, 3);
});

test("bestK braucht genug Punkte", () => {
  assert.throws(() => bestK([[0, 0], [1, 1]]));
});
