/**
 * Voronoi Cell Generator for irregular paper fragmentation
 */

import { randomRange, createSeededRandom } from './random.js';
import { fbm2D } from './noise.js';

// Generate Voronoi cell seed sites distributed evenly with organic noise jitter
export function generateVoronoiSites(count = 300, seed = 42) {
  const rng = createSeededRandom(seed);
  const sites = [];

  // Calculate grid size to distribute points evenly across [0,1] x [0,1]
  const cols = Math.ceil(Math.sqrt(count * 1.3));
  const rows = Math.ceil(count / cols);

  const dx = 1.0 / cols;
  const dy = 1.0 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (sites.length >= count) break;

      // Base cell position
      const baseX = (c + 0.5) * dx;
      const baseY = (r + 0.5) * dy;

      // Add noise-driven organic offset for irregular paper fracture shapes
      const noiseX = fbm2D(baseX * 5.0, baseY * 5.0) * 0.4 * dx;
      const noiseY = fbm2D(baseX * 5.0 + 10.0, baseY * 5.0 + 10.0) * 0.4 * dy;

      const jitterX = randomRange(-0.35 * dx, 0.35 * dx, rng) + noiseX;
      const jitterY = randomRange(-0.35 * dy, 0.35 * dy, rng) + noiseY;

      const x = Math.max(0.01, Math.min(0.99, baseX + jitterX));
      const y = Math.max(0.01, Math.min(0.99, baseY + jitterY));

      sites.push({ x, y, id: sites.length });
    }
  }

  return sites;
}

// Find nearest Voronoi site for any point (x, y)
export function getNearestSite(x, y, sites) {
  let minSqDist = Infinity;
  let nearestSite = null;
  let secondMinSqDist = Infinity;

  for (let i = 0; i < sites.length; i++) {
    const s = sites[i];
    const dx = x - s.x;
    const dy = y - s.y;
    const sqDist = dx * dx + dy * dy;

    if (sqDist < minSqDist) {
      secondMinSqDist = minSqDist;
      minSqDist = sqDist;
      nearestSite = s;
    } else if (sqDist < secondMinSqDist) {
      secondMinSqDist = sqDist;
    }
  }

  const dist1 = Math.sqrt(minSqDist);
  const dist2 = Math.sqrt(secondMinSqDist);
  const edgeDistance = (dist2 - dist1) * 0.5; // Distance to cell border line

  return {
    site: nearestSite,
    dist1,
    dist2,
    edgeDistance
  };
}

// Generate instanced attribute buffers for GPU Voronoi rendering
export function buildVoronoiInstanceBuffers(sites, pieceCount) {
  const count = Math.min(sites.length, pieceCount);
  
  const siteCoords = new Float32Array(count * 2);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const s = sites[i];
    siteCoords[i * 2 + 0] = s.x;
    siteCoords[i * 2 + 1] = s.y;
    seeds[i] = (i * 12.9898 + s.x * 78.233 + s.y * 43.123) % 1.0;
    scales[i * 2 + 0] = randomRange(0.7, 1.3);
    scales[i * 2 + 1] = randomRange(0.7, 1.3);
  }

  return {
    count,
    siteCoords,
    seeds,
    scales
  };
}
