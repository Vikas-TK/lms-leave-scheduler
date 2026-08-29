#version 300 es
precision highp float;

// Varyings from Vertex Shader
in vec2 vUv;
in vec2 vVoronoiCenter;
in vec3 vNormal;
in vec3 vWorldPosition;
in float vSeed;
in float vFragmentProgress;
in float vDepth;

// Uniforms
uniform vec3 uPaperColor;
uniform float uTime;
uniform float uProgress;
uniform float uGlowIntensity;
uniform bool uTransparent;
uniform vec2 uResolution;

out vec4 fragColor;

// Hash function for procedural noise
float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.12));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// 2D Noise
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Multi-octave FBM noise for paper texture & torn edges
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 4; i++) {
    value += amplitude * noise2D(p * frequency);
    frequency *= 2.1;
    amplitude *= 0.5;
  }
  return value;
}

// Procedural organic paper pulp fibers
float paperFibers(vec2 uv) {
  vec2 st = uv * 120.0;
  float n1 = noise2D(st + vec2(vSeed * 10.0));
  float n2 = noise2D(st * 3.0 + vec2(vSeed * 20.0));
  
  // Thin dark fiber strands
  float fiber = smoothstep(0.82, 0.95, sin(n1 * 20.0 + n2 * 10.0));
  return fiber * 0.15;
}

void main() {
  vec2 uv = vUv;

  // 1. Procedural Paper Grain & Pulp Texture
  float grain = fbm(uv * 45.0 + vec2(vSeed * 7.0)) * 0.12;
  float fibers = paperFibers(uv);

  // Subtle crease / fold marks across paper sheet
  float foldLine = sin((uv.x + uv.y * 0.7 + vSeed) * 12.0) * 0.03;
  foldLine = smoothstep(0.01, 0.04, abs(foldLine));

  // Base Paper Color with grain, fibers and folds
  vec3 paperBase = uPaperColor - vec3(grain) - vec3(fibers) - vec3(foldLine * 0.04);

  // 2. Torn Rough Edge Masking
  vec2 edgeDistVec = abs(uv - vec2(0.5)) * 2.0;
  float maxEdgeDist = max(edgeDistVec.x, edgeDistVec.y);

  // High frequency noise for paper edge tear rough fraying
  float edgeTearNoise = fbm(uv * 80.0 + vec2(vSeed * 13.0)) * 0.15;
  float tornEdgeThreshold = 0.92 - edgeTearNoise;
  
  // Smooth opacity drop-off at torn fragment edges
  float alphaMask = 1.0 - smoothstep(tornEdgeThreshold, 1.0, maxEdgeDist);

  // Highlight torn paper border fibers (whitish edge deckle)
  float edgeDeckle = smoothstep(tornEdgeThreshold - 0.08, tornEdgeThreshold, maxEdgeDist) * (1.0 - smoothstep(tornEdgeThreshold, 1.0, maxEdgeDist));
  paperBase += vec3(0.18, 0.16, 0.14) * edgeDeckle;

  // 3. 3D Lighting & Shading
  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(vec3(0.4, 0.8, 1.0)); // Top-left directional light
  
  // Diffuse Lighting
  float diff = max(0.0, dot(norm, lightDir));
  vec3 diffuse = paperBase * (0.6 + 0.4 * diff);

  // Specular Sheen (Subtle matte paper finish)
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(0.0, dot(norm, halfDir)), 16.0) * 0.08;
  diffuse += vec3(spec);

  // 4. Ambient Shadow & Depth Drop-off
  float ambientShadow = smoothstep(0.0, 3.0, vDepth) * 0.25;
  diffuse = mix(diffuse, diffuse * 0.75, ambientShadow);

  // Fragment crack edge darkening during early fracture stage
  if (uProgress > 0.0 && uProgress < 0.35) {
    float crackGlow = (0.35 - uProgress) / 0.35;
    float centerDist = length(uv - vec2(0.5));
    diffuse *= mix(1.0, 0.7, smoothstep(0.3, 0.5, centerDist) * crackGlow);
  }

  // 5. Final Output Alpha & Color
  float finalAlpha = uTransparent ? alphaMask : 1.0;
  
  // Discard fully transparent pixels outside torn fragment geometry
  if (finalAlpha < 0.01) {
    discard;
  }

  fragColor = vec4(diffuse, finalAlpha);
}
