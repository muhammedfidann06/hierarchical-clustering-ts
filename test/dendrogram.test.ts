import { test } from "node:test";
import assert from "node:assert/strict";
import { agglomerate } from "../src/clustering";
import { dendrogramSvg, escapeXml } from "../src/dendrogram";

const points = [[0, 0], [0, 1], [5, 5], [5, 6]];

test("SVG hat eine Klammer pro Merge und ein Label pro Punkt", () => {
  const merges = agglomerate(points, { linkage: "average" });
  const svg = dendrogramSvg(merges, points.length, ["a", "b", "c", "d"]);
  assert.equal((svg.match(/<path /g) ?? []).length, points.length - 1);
  assert.equal((svg.match(/<text /g) ?? []).length, points.length);
  assert.ok(svg.startsWith("<svg"));
});

test("Blätter, die zusammengehören, stehen nebeneinander", () => {
  const merges = agglomerate(points, { linkage: "single" });
  const svg = dendrogramSvg(merges, points.length, ["a", "b", "c", "d"]);
  const order = [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]).join("");
  // a und b sind nah beieinander, c und d auch
  assert.ok(/ab|ba/.test(order) && /cd|dc/.test(order), order);
});

test("Sonderzeichen in Labels werden escaped (sonst ungültiges SVG)", () => {
  const merges = agglomerate(points, { linkage: "average" });
  const svg = dendrogramSvg(merges, points.length, ["R&D", "A<B", "x", "y"]);
  assert.ok(svg.includes("R&amp;D"));
  assert.ok(svg.includes("A&lt;B"));
  assert.ok(!svg.includes("A<B"));
  assert.equal(escapeXml('"<&>'), "&quot;&lt;&amp;&gt;");
});
