/**
 * Demo: Wir clustern den Iris-Datensatz (Ausschnitt) und speichern ein Dendrogramm.
 * Starten mit: npm run demo
 */
import { writeFileSync } from "node:fs";
import { agglomerate, cutTree, Linkage, silhouette } from "./clustering";
import { dendrogramSvg } from "./dendrogram";
import { IRIS_SAMPLE } from "./data";

export * from "./clustering";
export * from "./dendrogram";

function main(): void {
  const points = IRIS_SAMPLE.map((r) => r.features);
  const names = IRIS_SAMPLE.map((r) => r.species[0].toUpperCase());

  // Wir testen alle Linkage-Methoden und vergleichen die Qualität.
  const methods: Linkage[] = ["single", "complete", "average", "ward"];
  for (const linkage of methods) {
    const merges = agglomerate(points, { linkage });
    const labels = cutTree(merges, points.length, 3);
    const score = silhouette(points, labels);
    console.log(`${linkage.padEnd(9)} Silhouette = ${score.toFixed(3)}`);

    // Wir speichern das Bild als Datei.
    writeFileSync(`dendrogram-${linkage}.svg`, dendrogramSvg(merges, points.length, names));
  }
  console.log("Fertig! Die SVG-Dateien sind im Ordner.");
}

// Nur starten, wenn die Datei direkt aufgerufen wird.
if (require.main === module) main();
