/**
 * Random utility functions for PaperShatter animation
 */

// Seeded pseudo-random number generator (LCG)
export function createSeededRandom(seed = 123456789) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Generate random number in range [min, max]
export function randomRange(min, max, rng = Math.random) {
  return min + rng() * (max - min);
}

// Generate random integer in range [min, max]
export function randomInt(min, max, rng = Math.random) {
  return Math.floor(randomRange(min, max + 1, rng));
}

// Generate random 2D vector in unit circle
export function randomInUnitCircle(rng = Math.random) {
  const angle = rng() * Math.PI * 2;
  const radius = Math.sqrt(rng());
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

// Generate random 3D unit vector on sphere surface
export function randomOnSphere(rng = Math.random) {
  const z = rng() * 2 - 1;
  const phi = rng() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return {
    x: r * Math.cos(phi),
    y: r * Math.sin(phi),
    z: z
  };
}

// Generate random 3D velocity vector with outward bias
export function randomExplosionVelocity(cellX, cellY, strength = 1.0, rng = Math.random) {
  // Dir from center (0.5, 0.5)
  const dirX = cellX - 0.5;
  const dirY = cellY - 0.5;
  const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1.0;
  
  const radialX = (dirX / len) * strength;
  const radialY = (dirY / len) * strength;

  const jitterX = randomRange(-0.4, 0.4, rng);
  const jitterY = randomRange(-0.4, 0.4, rng);
  const z = randomRange(0.2, 1.2, rng) * strength;

  return {
    x: radialX + jitterX,
    y: radialY + jitterY,
    z: z
  };
}

// Generate random angular velocity (rotation speeds around X, Y, Z axes)
export function randomAngularVelocity(maxSpeed = 5.0, rng = Math.random) {
  return {
    x: randomRange(-maxSpeed, maxSpeed, rng),
    y: randomRange(-maxSpeed, maxSpeed, rng),
    z: randomRange(-maxSpeed, maxSpeed, rng)
  };
}
