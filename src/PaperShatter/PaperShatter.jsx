import { useEffect, useRef } from 'react';
import { Renderer, Program, Geometry, Mesh, Color } from 'ogl';
import { generateVoronoiSites, buildVoronoiInstanceBuffers } from './utils/voronoi.js';
import { createPhysicsInstanceBuffers } from './utils/physics.js';
import { randomRange } from './utils/random.js';
import vertexShaderRaw from './shaders/vertex.glsl?raw';
import fragmentShaderRaw from './shaders/fragment.glsl?raw';
import './PaperShatter.css';

// Fallback shaders in case bundler lacks GLSL raw plugin loader
const defaultVertexShader = `#version 300 es
precision highp float;

in vec3 position;
in vec2 uv;
in vec3 normal;

in vec3 aOrigin;
in vec3 aVelocity;
in vec3 aAngularVel;
in vec2 aVoronoiCenter;
in float aSeed;
in float aDelay;

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

out vec2 vUv;
out vec2 vVoronoiCenter;
out vec3 vNormal;
out vec3 vWorldPosition;
out float vSeed;
out float vFragmentProgress;
out float vDepth;

mat3 rotationMatrix(vec3 angles) {
  vec3 c = cos(angles);
  vec3 s = sin(angles);

  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, c.x, -s.x, 0.0, s.x, c.x);
  mat3 ry = mat3(c.y, 0.0, s.y, 0.0, 1.0, 0.0, -s.y, 0.0, c.y);
  mat3 rz = mat3(c.z, -s.z, 0.0, s.z, c.z, 0.0, 0.0, 0.0, 1.0);

  return rz * ry * rx;
}

void main() {
  vUv = uv;
  vVoronoiCenter = aVoronoiCenter;
  vSeed = aSeed;

  float fragTime = max(0.0, uProgress - aDelay);
  vFragmentProgress = clamp(fragTime * 1.5, 0.0, 1.0);

  float floatWaveX = sin(uTime * 1.2 + aOrigin.y * 2.0) * 0.08;
  float floatWaveY = cos(uTime * 0.9 + aOrigin.x * 2.0) * 0.08;
  float floatWaveZ = sin(uTime * 1.5 + aSeed * 6.28) * 0.05;
  vec3 floatOffset = vec3(floatWaveX, floatWaveY, floatWaveZ) * (1.0 - vFragmentProgress);

  float t = fragTime * 2.2;
  float damping = exp(-0.75 * t);

  vec3 velDisp = aVelocity * t * damping;
  vec3 gravityDisp = vec3(0.0, -0.5 * uGravity * t * t, 0.0);

  float windX = uWind * (t + 0.3 * sin(t * 3.0 + aSeed * 10.0));
  float windY = uWind * 0.15 * cos(t * 2.0 + aSeed * 5.0);
  vec3 windDisp = vec3(windX, windY, 0.0);

  vec2 fragScreenPos = aOrigin.xy;
  vec2 mouseVec = fragScreenPos - uMouse;
  float mouseDist = length(mouseVec);
  vec3 mousePush = vec3(0.0);
  if (mouseDist < 0.8 && uMouseActive > 0.0) {
    float force = (1.0 - mouseDist / 0.8) * uMouseActive * 1.8;
    vec2 pushDir = normalize(mouseVec + vec2(0.001));
    mousePush = vec3(pushDir * force, force * 0.5);
  }

  vec3 shatteredPos = aOrigin + velDisp + gravityDisp + windDisp + mousePush;

  vec3 rotAngles = aAngularVel * t * damping + mousePush * 2.0;
  mat3 currentRot = rotationMatrix(rotAngles * (1.0 - uRebuildProgress) * vFragmentProgress);

  vec3 finalOrigin = aOrigin + floatOffset;
  vec3 currentPos = mix(finalOrigin, shatteredPos, vFragmentProgress);
  currentPos = mix(currentPos, finalOrigin, uRebuildProgress);

  vec3 localVertexPos = position * mix(1.0, 0.85, vFragmentProgress * (1.0 - uRebuildProgress));
  vec3 transformedPos = currentRot * localVertexPos + currentPos;

  vNormal = normalize(normalMatrix * (currentRot * normal));

  vec4 mvPosition = modelViewMatrix * vec4(transformedPos, 1.0);
  vWorldPosition = transformedPos;
  vDepth = -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;
}
`;

const defaultFragmentShader = `#version 300 es
precision highp float;

in vec2 vUv;
in vec2 vVoronoiCenter;
in vec3 vNormal;
in vec3 vWorldPosition;
in float vSeed;
in float vFragmentProgress;
in float vDepth;

uniform vec3 uPaperColor;
uniform float uTime;
uniform float uProgress;
uniform bool uTransparent;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.12));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

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

float paperFibers(vec2 uv) {
  vec2 st = uv * 120.0;
  float n1 = noise2D(st + vec2(vSeed * 10.0));
  float n2 = noise2D(st * 3.0 + vec2(vSeed * 20.0));
  float fiber = smoothstep(0.82, 0.95, sin(n1 * 20.0 + n2 * 10.0));
  return fiber * 0.15;
}

void main() {
  vec2 uv = vUv;

  float grain = fbm(uv * 45.0 + vec2(vSeed * 7.0)) * 0.12;
  float fibers = paperFibers(uv);

  float foldLine = sin((uv.x + uv.y * 0.7 + vSeed) * 12.0) * 0.03;
  foldLine = smoothstep(0.01, 0.04, abs(foldLine));

  vec3 paperBase = uPaperColor - vec3(grain) - vec3(fibers) - vec3(foldLine * 0.04);

  vec2 edgeDistVec = abs(uv - vec2(0.5)) * 2.0;
  float maxEdgeDist = max(edgeDistVec.x, edgeDistVec.y);

  float edgeTearNoise = fbm(uv * 80.0 + vec2(vSeed * 13.0)) * 0.15;
  float tornEdgeThreshold = 0.92 - edgeTearNoise;
  
  float alphaMask = 1.0 - smoothstep(tornEdgeThreshold, 1.0, maxEdgeDist);

  float edgeDeckle = smoothstep(tornEdgeThreshold - 0.08, tornEdgeThreshold, maxEdgeDist) * (1.0 - smoothstep(tornEdgeThreshold, 1.0, maxEdgeDist));
  paperBase += vec3(0.18, 0.16, 0.14) * edgeDeckle;

  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(vec3(0.4, 0.8, 1.0));
  
  float diff = max(0.0, dot(norm, lightDir));
  vec3 diffuse = paperBase * (0.6 + 0.4 * diff);

  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(0.0, dot(norm, halfDir)), 16.0) * 0.08;
  diffuse += vec3(spec);

  float ambientShadow = smoothstep(0.0, 3.0, vDepth) * 0.25;
  diffuse = mix(diffuse, diffuse * 0.75, ambientShadow);

  float finalAlpha = uTransparent ? alphaMask : 1.0;
  
  if (finalAlpha < 0.01) {
    discard;
  }

  fragColor = vec4(diffuse, finalAlpha);
}
`;

export default function PaperShatter({
  pieces = 300,
  gravity = 0.5,
  wind = 0.2,
  mouseInteraction = true,
  paperTexture = '/paper.jpg',
  paperColor = '#F6F2E8',
  tearSpeed = 1.0,
  rebuild = true,
  rebuildDelay = 5000,
  rebuildSpeed = 0.5,
  dustParticles = true,
  particleCount = 200,
  quality = 'high',
  transparent = true,
  ...rest
}) {
  const containerRef = useRef(null);
  const targetMouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const mouseActive = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const vertexShader = vertexShaderRaw || defaultVertexShader;
    const fragmentShader = fragmentShaderRaw || defaultFragmentShader;

    // Initialize WebGL Renderer via OGL
    const renderer = new Renderer({
      alpha: transparent,
      dpr: quality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1,
      antialias: true
    });

    const gl = renderer.gl;
    if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0.05, 0.05, 0.05, 1);
    }

    // 1. Build Base Fragment Mesh Geometry (Quads representing individual paper pieces)
    const pieceWidth = 2.4 / Math.sqrt(pieces);
    const pieceHeight = 3.2 / Math.sqrt(pieces);

    const quadPositions = new Float32Array([
      -pieceWidth * 0.5, -pieceHeight * 0.5, 0,
       pieceWidth * 0.5, -pieceHeight * 0.5, 0,
       pieceWidth * 0.5,  pieceHeight * 0.5, 0,
      -pieceWidth * 0.5,  pieceHeight * 0.5, 0
    ]);

    const quadUvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ]);

    const quadNormals = new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1
    ]);

    const quadIndices = new Uint16Array([
      0, 1, 2,
      0, 2, 3
    ]);

    // 2. Generate Voronoi Cell Sites & Instanced Physics Buffers
    const voronoiSites = generateVoronoiSites(pieces, 12345);
    const voronoiBuffers = buildVoronoiInstanceBuffers(voronoiSites, pieces);
    const physicsBuffers = createPhysicsInstanceBuffers(pieces, voronoiSites, gravity);

    // 3. Create OGL Instanced Geometry
    const geometry = new Geometry(gl, {
      position: { size: 3, data: quadPositions },
      uv: { size: 2, data: quadUvs },
      normal: { size: 3, data: quadNormals },
      index: { data: quadIndices },
      aOrigin: { size: 3, data: physicsBuffers.origins, instanced: 1 },
      aVelocity: { size: 3, data: physicsBuffers.velocities, instanced: 1 },
      aAngularVel: { size: 3, data: physicsBuffers.angularVelocities, instanced: 1 },
      aVoronoiCenter: { size: 2, data: voronoiBuffers.siteCoords, instanced: 1 },
      aSeed: { size: 1, data: voronoiBuffers.seeds, instanced: 1 },
      aDelay: { size: 1, data: physicsBuffers.delays, instanced: 1 }
    });

    const parsedPaperColor = new Color(paperColor);

    // 4. Create OGL Shader Program
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uGravity: { value: gravity },
        uWind: { value: wind },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseActive: { value: 0 },
        uRebuildProgress: { value: 0 },
        uPaperColor: { value: parsedPaperColor },
        uTransparent: { value: transparent },
        uResolution: { value: new Float32Array([gl.canvas.width, gl.canvas.height]) }
      },
      transparent: transparent
    });

    const mesh = new Mesh(gl, { geometry, program });

    // 5. Handle Viewport Resizing
    function resize() {
      const width = container.offsetWidth || window.innerWidth;
      const height = container.offsetHeight || window.innerHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value[0] = width;
      program.uniforms.uResolution.value[1] = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // 6. Animation State Variables
    let animationFrameId;
    let startTime = performance.now();
    let isShattered = false;
    let shatterProgress = 0;
    let rebuildProgress = 0;
    let rebuildTimer = null;

    function triggerTear() {
      isShattered = true;
      if (rebuildTimer) clearTimeout(rebuildTimer);

      if (rebuild) {
        rebuildTimer = setTimeout(() => {
          // Trigger smooth rebuild backwards
          isShattered = false;
        }, rebuildDelay);
      }
    }

    // 7. Render Loop
    function update(t) {
      animationFrameId = requestAnimationFrame(update);
      const elapsedTime = (t - startTime) * 0.001;

      // Update Shatter Progress
      if (isShattered) {
        shatterProgress = Math.min(1.0, shatterProgress + 0.015 * tearSpeed);
        rebuildProgress = Math.max(0.0, rebuildProgress - 0.02 * rebuildSpeed);
      } else {
        if (shatterProgress > 0) {
          rebuildProgress = Math.min(1.0, rebuildProgress + 0.015 * rebuildSpeed);
          if (rebuildProgress >= 1.0) {
            shatterProgress = 0;
            rebuildProgress = 0;
          }
        }
      }

      // Mouse position smoothing
      const lerp = 0.1;
      smoothMouse.current.x += (targetMouse.current.x - smoothMouse.current.x) * lerp;
      smoothMouse.current.y += (targetMouse.current.y - smoothMouse.current.y) * lerp;

      // Update uniforms
      program.uniforms.uTime.value = elapsedTime;
      program.uniforms.uProgress.value = shatterProgress;
      program.uniforms.uRebuildProgress.value = rebuildProgress;
      program.uniforms.uMouse.value[0] = smoothMouse.current.x;
      program.uniforms.uMouse.value[1] = smoothMouse.current.y;
      program.uniforms.uMouseActive.value = mouseActive.current;

      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);
    container.appendChild(gl.canvas);

    // 8. Event Listeners
    function handleMouseMove(e) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.current = { x, y };
      mouseActive.current = 1.0;
    }

    function handleMouseLeave() {
      mouseActive.current = 0.0;
    }

    function handleClick() {
      triggerTear();
    }

    if (mouseInteraction) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('click', handleClick);
    }

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (rebuildTimer) clearTimeout(rebuildTimer);
      window.removeEventListener('resize', resize);
      if (mouseInteraction) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('click', handleClick);
      }
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    pieces,
    gravity,
    wind,
    mouseInteraction,
    paperTexture,
    paperColor,
    tearSpeed,
    rebuild,
    rebuildDelay,
    rebuildSpeed,
    dustParticles,
    particleCount,
    quality,
    transparent
  ]);

  return <div ref={containerRef} className="paper-shatter-container" {...rest} />;
}
