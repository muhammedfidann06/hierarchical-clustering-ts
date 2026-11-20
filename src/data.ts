// Ein kleiner Teil vom Iris-Datensatz (Fisher, 1936).
// Merkmale: Kelchblatt-Länge, Kelchblatt-Breite, Blütenblatt-Länge, Blütenblatt-Breite (cm).
export interface IrisRow {
  features: number[];
  species: "setosa" | "versicolor" | "virginica";
}

export const IRIS_SAMPLE: IrisRow[] = [
  { features: [5.1, 3.5, 1.4, 0.2], species: "setosa" },
  { features: [4.9, 3.0, 1.4, 0.2], species: "setosa" },
  { features: [4.7, 3.2, 1.3, 0.2], species: "setosa" },
  { features: [4.6, 3.1, 1.5, 0.2], species: "setosa" },
  { features: [5.0, 3.6, 1.4, 0.2], species: "setosa" },
  { features: [5.4, 3.9, 1.7, 0.4], species: "setosa" },
  { features: [7.0, 3.2, 4.7, 1.4], species: "versicolor" },
  { features: [6.4, 3.2, 4.5, 1.5], species: "versicolor" },
  { features: [6.9, 3.1, 4.9, 1.5], species: "versicolor" },
  { features: [5.5, 2.3, 4.0, 1.3], species: "versicolor" },
  { features: [6.5, 2.8, 4.6, 1.5], species: "versicolor" },
  { features: [5.7, 2.8, 4.5, 1.3], species: "versicolor" },
  { features: [6.3, 3.3, 6.0, 2.5], species: "virginica" },
  { features: [5.8, 2.7, 5.1, 1.9], species: "virginica" },
  { features: [7.1, 3.0, 5.9, 2.1], species: "virginica" },
  { features: [6.3, 2.9, 5.6, 1.8], species: "virginica" },
  { features: [6.5, 3.0, 5.8, 2.2], species: "virginica" },
  { features: [7.6, 3.0, 6.6, 2.1], species: "virginica" },
];
