/**
 * Physics & Simulation calculations for PaperShatter
 */

import { randomExplosionVelocity, randomAngularVelocity, randomRange } from './random.js';

// Calculate physics trajectory state for instanced fragment at time 't'
export function calculateFragmentTransform(
  originX, originY,
  velX, velY, velZ,
  angVelX, angVelY, angVelZ,
  time, progress,
  gravity, wind, mouseImpact,
  rebuildFactor
) {
  // Effective physics time parameter
  const t = Math.max(0, time * progress);

  // Air resistance friction damping
  const damping = Math.exp(-0.8 * t);

  // Velocity displacement
  let px = originX + velX * t * damping;
  let py = originY + velY * t * damping;
  let pz = velZ * t * damping;

  // Apply gravity (pulls downward along Y axis)
  py -= 0.5 * gravity * t * t;

  // Apply wind force (side drift + turbulent flutter)
  const windEffectX = wind * (t + 0.2 * Math.sin(t * 3.0));
  const windEffectY = wind * 0.1 * Math.cos(t * 2.0);
  px += windEffectX;
  py += windEffectY;

  // Apply mouse repulsion impulse
  px += mouseImpact.x * damping;
  py += mouseImpact.y * damping;
  pz += mouseImpact.z * damping;

  // Rotation angles
  const rotX = angVelX * t * damping;
  const rotY = angVelY * t * damping;
  const rotZ = angVelZ * t * damping;

  // Interpolate back to origin when rebuilding
  px = px * (1.0 - rebuildFactor) + originX * rebuildFactor;
  py = py * (1.0 - rebuildFactor) + originY * rebuildFactor;
  pz = pz * (1.0 - rebuildFactor);

  return {
    position: [px, py, pz],
    rotation: [rotX * (1.0 - rebuildFactor), rotY * (1.0 - rebuildFactor), rotZ * (1.0 - rebuildFactor)],
    scale: 1.0 - 0.2 * progress * (1.0 - rebuildFactor)
  };
}

// Generate instanced physics initial attribute buffers
export function createPhysicsInstanceBuffers(count, sites, gravityScale = 1.0) {
  const origins = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const angularVelocities = new Float32Array(count * 3);
  const delays = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const s = sites[i] || { x: Math.random(), y: Math.random() };

    // Initial position on sheet: X in [-1, 1], Y in [-1.3, 1.3]
    const ox = (s.x - 0.5) * 2.4;
    const oy = (s.y - 0.5) * 3.2;
    const oz = 0.0;

    origins[i * 3 + 0] = ox;
    origins[i * 3 + 1] = oy;
    origins[i * 3 + 2] = oz;

    // Explosive physics velocity
    const vel = randomExplosionVelocity(s.x, s.y, 2.5 * gravityScale);
    velocities[i * 3 + 0] = vel.x;
    velocities[i * 3 + 1] = vel.y;
    velocities[i * 3 + 2] = vel.z;

    // Angular rotational momentum
    const ang = randomAngularVelocity(8.0);
    angularVelocities[i * 3 + 0] = ang.x;
    angularVelocities[i * 3 + 1] = ang.y;
    angularVelocities[i * 3 + 2] = ang.z;

    // Delayed fracture propagation outwards from center/mouse
    const centerDist = Math.sqrt((s.x - 0.5) ** 2 + (s.y - 0.5) ** 2);
    delays[i] = centerDist * 0.6 + randomRange(0, 0.15);
  }

  return {
    origins,
    velocities,
    angularVelocities,
    delays
  };
}
