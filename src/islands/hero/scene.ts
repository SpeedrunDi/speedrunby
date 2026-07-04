// The hero WebGL world — the ONLY chunk that imports three.
// Two renderers: a full-hero "agent orchestration" constellation and a
// depth-parallax portrait plane (Facebook-3D-photo technique). Everything
// is uniform-driven: no per-frame allocations, no neighbour searches.
import * as THREE from 'three';
import type { Tier } from '../../lib/device-tier';

export interface SceneHandle {
  destroy(): void;
  setTheme(): void;
  pause(): void;
  resume(): void;
}

/* ---------------- helpers ---------------- */

function cssColor(name: string): THREE.Color {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || '#e0855c');
}

// deterministic pseudo-random (stable constellation between visits)
function prand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------------- constellation ---------------- */

interface Cluster {
  cx: number;
  cy: number;
  r: number;
  count: number;
}

export function initConstellation(canvas: HTMLCanvasElement, tier: Tier): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  const dprCap = tier === 'high' ? 1.75 : 1.25;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);

  // clusters in normalized hero space: orchestrator sits right-of-center
  // (behind the portrait), satellites orbit the copy side
  const clusters: Cluster[] = [
    { cx: 0.72, cy: 0.45, r: 0.2, count: tier === 'high' ? 420 : 210 }, // orchestrator
    { cx: 0.16, cy: 0.2, r: 0.1, count: tier === 'high' ? 130 : 65 },
    { cx: 0.38, cy: 0.12, r: 0.08, count: tier === 'high' ? 110 : 55 },
    { cx: 0.09, cy: 0.62, r: 0.09, count: tier === 'high' ? 120 : 60 },
    { cx: 0.45, cy: 0.85, r: 0.1, count: tier === 'high' ? 130 : 65 },
    { cx: 0.9, cy: 0.14, r: 0.07, count: tier === 'high' ? 90 : 45 },
  ];

  const total = clusters.reduce((s, c) => s + c.count, 0);
  const positions = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const phases = new Float32Array(total);
  let p = 0;
  clusters.forEach((c, ci) => {
    for (let i = 0; i < c.count; i++) {
      const seed = ci * 1000 + i;
      const angle = prand(seed) * Math.PI * 2;
      const rad = Math.sqrt(prand(seed + 0.5)) * c.r;
      positions[p * 3] = c.cx + Math.cos(angle) * rad;
      positions[p * 3 + 1] = c.cy + Math.sin(angle) * rad * 0.85;
      positions[p * 3 + 2] = prand(seed + 0.7);
      sizes[p] = 1.5 + prand(seed + 0.3) * 2.6;
      phases[p] = prand(seed + 0.9) * Math.PI * 2;
      p++;
    }
  });

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  pointsGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.72, 0.45) },
    uClay: { value: cssColor('--su-clay') },
    uBright: { value: cssColor('--su-clay-bright') },
    uDpr: { value: Math.min(window.devicePixelRatio, dprCap) },
  };

  const pointsMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uDpr;
      varying float vDepth;
      varying float vGlow;
      void main() {
        vec3 pos = position;
        // gentle drift
        pos.x += sin(uTime * 0.28 + aPhase) * 0.006;
        pos.y += cos(uTime * 0.22 + aPhase * 1.7) * 0.006;
        // pointer attraction (local, capped)
        vec2 d = uPointer - pos.xy;
        float dist = length(d);
        float pull = smoothstep(0.28, 0.0, dist) * 0.02;
        pos.xy += normalize(d + 1e-5) * pull;
        vGlow = smoothstep(0.22, 0.0, dist);
        vDepth = position.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * uDpr * (0.75 + vDepth * 0.5 + vGlow * 0.8);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uClay;
      uniform vec3 uBright;
      varying float vDepth;
      varying float vGlow;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float disc = smoothstep(0.5, 0.12, d);
        vec3 col = mix(uClay, uBright, vDepth * 0.6 + vGlow * 0.4);
        gl_FragColor = vec4(col, disc * (0.35 + vDepth * 0.35 + vGlow * 0.45));
      }
    `,
  });
  scene.add(new THREE.Points(pointsGeo, pointsMat));

  /* ----- edges: intra-cluster k-links + orchestrator spokes ----- */
  const edgeVerts: number[] = [];
  const edgeT: number[] = [];
  const edgeIndex: number[] = [];
  let edgeCount = 0;
  const clusterOffsets: number[] = [];
  {
    let off = 0;
    clusters.forEach((c) => {
      clusterOffsets.push(off);
      off += c.count;
    });
  }
  const pushEdge = (a: number, b: number) => {
    edgeVerts.push(
      positions[a * 3],
      positions[a * 3 + 1],
      positions[a * 3 + 2],
      positions[b * 3],
      positions[b * 3 + 1],
      positions[b * 3 + 2],
    );
    edgeT.push(0, 1);
    edgeIndex.push(edgeCount, edgeCount);
    edgeCount++;
  };
  // sparse links inside each cluster
  clusters.forEach((c, ci) => {
    const base = clusterOffsets[ci];
    const links = tier === 'high' ? Math.floor(c.count * 0.35) : Math.floor(c.count * 0.22);
    for (let i = 0; i < links; i++) {
      const a = base + Math.floor(prand(ci * 77 + i) * c.count);
      const b = base + Math.floor(prand(ci * 77 + i + 0.5) * c.count);
      if (a !== b) pushEdge(a, b);
    }
  });
  // spokes: orchestrator core → each satellite core
  for (let ci = 1; ci < clusters.length; ci++) {
    for (let s = 0; s < 3; s++) {
      const a = clusterOffsets[0] + Math.floor(prand(ci * 13 + s) * clusters[0].count);
      const b = clusterOffsets[ci] + Math.floor(prand(ci * 31 + s) * clusters[ci].count);
      pushEdge(a, b);
    }
  }

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgeVerts), 3));
  edgeGeo.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(edgeT), 1));
  edgeGeo.setAttribute('aEdge', new THREE.BufferAttribute(new Float32Array(edgeIndex), 1));

  const edgeUniforms = {
    uClay: uniforms.uClay,
    uBright: uniforms.uBright,
    uPointer: uniforms.uPointer,
    uPulseEdge: { value: -1 },
    uPulseT: { value: 0 },
  };
  const edgeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: edgeUniforms,
    vertexShader: /* glsl */ `
      attribute float aT;
      attribute float aEdge;
      uniform vec2 uPointer;
      varying float vT;
      varying float vEdge;
      varying float vNear;
      void main() {
        vT = aT;
        vEdge = aEdge;
        vNear = smoothstep(0.3, 0.0, length(uPointer - position.xy));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uClay;
      uniform vec3 uBright;
      uniform float uPulseEdge;
      uniform float uPulseT;
      varying float vT;
      varying float vEdge;
      varying float vNear;
      void main() {
        float base = 0.045 + vNear * 0.1;
        // travelling signal on the chosen edge
        float pulse = 0.0;
        if (abs(vEdge - uPulseEdge) < 0.5) {
          pulse = smoothstep(0.18, 0.0, abs(vT - uPulseT)) * 0.85;
        }
        vec3 col = mix(uClay, uBright, pulse);
        gl_FragColor = vec4(col, base + pulse);
      }
    `,
  });
  scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

  /* ----- loop, pointer, lifecycle ----- */
  const target = new THREE.Vector2(0.72, 0.45);
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
  };
  resize();
  window.addEventListener('resize', resize);

  let raf = 0;
  let running = false;
  let pulseEdge = Math.floor(prand(1) * edgeCount);
  let pulseStart = 0;
  const clock = new THREE.Clock();

  const frame = () => {
    if (!running) return;
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uPointer.value.lerp(target, 0.06);
    // a signal travels one random edge every ~2.2s
    const cycle = 2.2;
    const local = (t - pulseStart) / 1.1;
    if (local >= 1 && t - pulseStart > cycle) {
      pulseStart = t;
      pulseEdge = Math.floor(prand(t) * edgeCount);
    }
    edgeUniforms.uPulseEdge.value = pulseEdge;
    edgeUniforms.uPulseT.value = Math.min(local, 1);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  const handle: SceneHandle = {
    pause() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resume() {
      if (running) return;
      running = true;
      clock.start();
      raf = requestAnimationFrame(frame);
    },
    setTheme() {
      uniforms.uClay.value = cssColor('--su-clay');
      uniforms.uBright.value = cssColor('--su-clay-bright');
    },
    destroy() {
      this.pause();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      pointsGeo.dispose();
      edgeGeo.dispose();
      pointsMat.dispose();
      edgeMat.dispose();
      renderer.dispose();
    },
  };
  handle.resume();
  return handle;
}
