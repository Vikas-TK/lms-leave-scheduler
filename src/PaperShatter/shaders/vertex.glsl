#version 300 es
precision highp float;

// Standard geometry attributes
in vec3 position;
in vec2 uv;
in vec3 normal;

// Instanced fragment attributes
in vec3 aOrigin;
in vec3 aVelocity;
in vec3 aAngularVel;
in vec2 aVoronoiCenter;
in float aSeed;
in float aDelay;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uTime;
uniform float uProgress;
uniform float uGravity;
uniform float uWind;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uRebuildProgress;
uniform vec2 uResolution;

// Varyings to Fragment Shader
out vec2 vUv;
out vec2 vVoronoiCenter;
out vec3 vNormal;
out vec3 vWorldPosition;
out float vSeed;
out float vFragmentProgress;
out float vDepth;
out float vEdgeDist;

// Euler rotation matrix builder
mat3 rotationMatrix(vec3 angles) {
  vec3 c = cos(angles);
  vec3 s = sin(angles);

  mat3 rx = mat3(
    1.0, 0.0, 0.0,
    0.0, c.x, -s.x,
    0.0, s.x, c.x
  );

  mat3 ry = mat3(
    c.y, 0.0, s.y,
    0.0, 1.0, 0.0,
    -s.y, 0.0, c.y
  );

  mat3 rz = mat3(
    c.z, -s.z, 0.0,
    s.z, c.z, 0.0,
    0.0, 0.0, 1.0
  );

  return rz * ry * rx;
}

void main() {
  vUv = uv;
  vVoronoiCenter = aVoronoiCenter;
  vSeed = aSeed;

  // Calculate local time for this specific fragment considering fracture propagation delay
  float fragTime = max(0.0, uProgress - aDelay);
  vFragmentProgress = clamp(fragTime * 1.5, 0.0, 1.0);

  // Phase 1: Floating paper sheet state before shatter
  float floatWaveX = sin(uTime * 1.2 + aOrigin.y * 2.0) * 0.08;
  float floatWaveY = cos(uTime * 0.9 + aOrigin.x * 2.0) * 0.08;
  float floatWaveZ = sin(uTime * 1.5 + aSeed * 6.28) * 0.05;
  vec3 floatOffset = vec3(floatWaveX, floatWaveY, floatWaveZ) * (1.0 - vFragmentProgress);

  // Phase 2: Shatter explosion trajectory
  float t = fragTime * 2.2;
  float damping = exp(-0.75 * t);

  // Velocity displacement with physics
  vec3 velDisp = aVelocity * t * damping;

  // Gravity acceleration (downward on Y)
  vec3 gravityDisp = vec3(0.0, -0.5 * uGravity * t * t, 0.0);

  // Wind turbulence
  float windX = uWind * (t + 0.3 * sin(t * 3.0 + aSeed * 10.0));
  float windY = uWind * 0.15 * cos(t * 2.0 + aSeed * 5.0);
  vec3 windDisp = vec3(windX, windY, 0.0);

  // Mouse Repulsion Force calculation
  vec2 fragScreenPos = aOrigin.xy;
  vec2 mouseVec = fragScreenPos - uMouse;
  float mouseDist = length(mouseVec);
  vec3 mousePush = vec3(0.0);
  if (mouseDist < 0.8 && uMouseActive > 0.0) {
    float force = (1.0 - mouseDist / 0.8) * uMouseActive * 1.8;
    vec2 pushDir = normalize(mouseVec + vec2(0.001));
    mousePush = vec3(pushDir * force, force * 0.5);
  }

  // Combine fragment displacement
  vec3 shatteredPos = aOrigin + velDisp + gravityDisp + windDisp + mousePush;

  // Rotational angular momentum
  vec3 rotAngles = aAngularVel * t * damping + mousePush * 2.0;
  mat3 rotMat = rotationMatrix(rotAngles);

  // Rebuild interpolation back to original paper sheet position
  vec3 finalOrigin = aOrigin + floatOffset;
  vec3 currentPos = mix(finalOrigin, shatteredPos, vFragmentProgress);
  currentPos = mix(currentPos, finalOrigin, uRebuildProgress);

  // Apply fragment rotation around Voronoi centroid
  mat3 currentRot = rotationMatrix(rotAngles * (1.0 - uRebuildProgress) * vFragmentProgress);
  vec3 localVertexPos = position * mix(1.0, 0.85, vFragmentProgress * (1.0 - uRebuildProgress));
  vec3 transformedPos = currentRot * localVertexPos + currentPos;

  // Transform Normal
  vNormal = normalize(normalMatrix * (currentRot * normal));

  // Compute final screen position
  vec4 mvPosition = modelViewMatrix * vec4(transformedPos, 1.0);
  vWorldPosition = transformedPos;
  vDepth = -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;
}
