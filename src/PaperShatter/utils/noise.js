/**
 * 2D & 3D Simplex Noise generator for CPU particle & physics simulations
 */

// Permutation table for noise lookup
const PERM = new Uint8Array(512);
const P = new Uint8Array(256);

// Initialize permutation table
for (let i = 0; i < 256; i++) {
  P[i] = Math.floor(Math.random() * 256);
}
for (let i = 0; i < 512; i++) {
  PERM[i] = P[i & 255];
}

const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];

const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

function dot2D(g, x, y) {
  return g[0] * x + g[1] * y;
}

export function simplex2D(xin, yin) {
  let n0, n1, n2;

  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;

  let i1, j1;
  if (x0 > y0) {
    i1 = 1; j1 = 0;
  } else {
    i1 = 0; j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  const ii = i & 255;
  const jj = j & 255;

  const gi0 = PERM[ii + PERM[jj]] % 12;
  const gi1 = PERM[ii + i1 + PERM[jj + j1]] % 12;
  const gi2 = PERM[ii + 1 + PERM[jj + 1]] % 12;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 < 0) n0 = 0.0;
  else {
    t0 *= t0;
    n0 = t0 * t0 * dot2D(GRAD3[gi0], x0, y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 < 0) n1 = 0.0;
  else {
    t1 *= t1;
    n1 = t1 * t1 * dot2D(GRAD3[gi1], x1, y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 < 0) n2 = 0.0;
  else {
    t2 *= t2;
    n2 = t2 * t2 * dot2D(GRAD3[gi2], x2, y2);
  }

  return 70.0 * (n0 + n1 + n2);
}

// Fractional Brownian Motion for multi-octave noise
export function fbm2D(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += simplex2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue;
}
