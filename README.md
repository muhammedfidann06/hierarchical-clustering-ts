# 🌳 Hierarchical Clustering in TypeScript

[![tests](https://github.com/muhammedfidann06/hierarchical-clustering-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammedfidann06/hierarchical-clustering-ts/actions/workflows/ci.yml)

A from-scratch implementation of **Hierarchical Agglomerative Clustering (HAC)** – no ML libraries.

> 🇩🇪 **Kurzbeschreibung:** Hierarchisches Clustering ohne fertige Bibliotheken – vier Linkage-Methoden,
> Silhouette-Koeffizient und Dendrogramme als SVG. Mit Unit-Tests und CI.

## Features
- Linkage methods: **single, complete, average, Ward** (via the Lance–Williams update formula)
- Distance metrics: Euclidean, Manhattan, cosine
- `cutTree` – cut the dendrogram into *k* flat clusters (union–find)
- **Silhouette score** for cluster quality
- **SVG dendrogram** renderer (no dependencies)
- Unit tests with the built-in `node:test` runner

## Run
```bash
npm install
npm test        # unit tests
npm run demo    # clusters an Iris sample and writes dendrogram-*.svg
```

## How it works
1. Every point starts as its own cluster.
2. Find the two closest clusters and merge them.
3. Update distances with Lance–Williams (O(n) per merge instead of recomputing).
4. Repeat until one cluster is left → the merge list is the dendrogram.

Complexity: O(n³) time, O(n²) memory – fine for teaching and small datasets.

## Skills
TypeScript · algorithms · unsupervised learning · data visualization · testing
