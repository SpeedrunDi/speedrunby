// The hero WebGL world — the ONLY chunk that imports three.
// A full-hero "agent orchestration" constellation that doubles as a live,
// legible multi-agent trace (dispatch → tool_call → result → PASS →
// synthesize) and answers a pointer poke. Everything is uniform-driven:
// no per-frame allocations, no neighbour searches (poke runs its search
// once per click, never per frame).
import * as THREE from 'three';
import type { Tier } from '../../lib/device-tier';

export interface SceneHandle {
  destroy(): void;
  setTheme(): void;
  pause(): void;
  resume(): void;
  /** Fire a signal from the node nearest the pointer (client coords). */
  poke(clientX: number, clientY: number): void;
}

// clamp01-smoothstep — soft ease for the signal head and blooms
function sstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
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

  // arrival-bloom is the one shader change; keep its runtime cost off on
  // low-tier devices (the uniforms compile either way, the effect stays 0)
  const bloomOn = tier === 'high';

  const total = clusters.reduce((s, c) => s + c.count, 0);
  const positions = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const phases = new Float32Array(total);
  const clusterId = new Float32Array(total);
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
      clusterId[p] = ci;
      p++;
    }
  });

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  pointsGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  pointsGeo.setAttribute('aCluster', new THREE.BufferAttribute(clusterId, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.72, 0.45) },
    uClay: { value: cssColor('--su-clay') },
    uBright: { value: cssColor('--su-clay-bright') },
    uDpr: { value: Math.min(window.devicePixelRatio, dprCap) },
    // live-trace arrival bloom: which cluster is lighting, and how hard
    uActiveNode: { value: -1 },
    uActiveAmt: { value: 0 },
    uGate: { value: 0 },
  };

  const pointsMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aPhase;
      attribute float aCluster;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uDpr;
      uniform float uActiveNode;
      uniform float uActiveAmt;
      uniform float uGate;
      varying float vDepth;
      varying float vGlow;
      varying float vActive;
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
        // 1.0 for points in the currently-active trace cluster, else 0.0
        vActive = step(abs(aCluster - uActiveNode), 0.5);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * uDpr
          * (0.75 + vDepth * 0.5 + vGlow * 0.8)
          * (1.0 + vActive * (uActiveAmt * 0.5 + uGate * 0.5));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uClay;
      uniform vec3 uBright;
      uniform float uActiveAmt;
      uniform float uGate;
      varying float vDepth;
      varying float vGlow;
      varying float vActive;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float disc = smoothstep(0.5, 0.12, d);
        vec3 col = mix(uClay, uBright, vDepth * 0.6 + vGlow * 0.4);
        // arrival bloom — 0 at rest, so the resting field is unchanged
        float bloom = vActive * (uActiveAmt * 0.32 + uGate * 0.48);
        col = mix(col, uBright, min(1.0, bloom));
        gl_FragColor = vec4(col, disc * (0.35 + vDepth * 0.35 + vGlow * 0.45) + bloom * disc);
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
  // spokes: orchestrator core → each satellite core. Capture one spoke edge
  // per satellite so the live trace can address orchestrator↔role hops.
  // A-endpoint (aT=0) is the orchestrator, B-endpoint (aT=1) the satellite,
  // so uPulseT 0→1 travels OUT and 1→0 travels IN — no shader change.
  const roleSpokes: number[][] = clusters.map(() => []);
  for (let ci = 1; ci < clusters.length; ci++) {
    for (let s = 0; s < 3; s++) {
      const a = clusterOffsets[0] + Math.floor(prand(ci * 13 + s) * clusters[0].count);
      const b = clusterOffsets[ci] + Math.floor(prand(ci * 31 + s) * clusters[ci].count);
      roleSpokes[ci].push(edgeCount);
      pushEdge(a, b);
    }
  }

  const edgePos = new Float32Array(edgeVerts);
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
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

  /* ----- live-trace overlay (role labels), behind copy/portrait ----- */
  // cluster index → role token; identical in RU/EN by design (system
  // identifiers), decorative + aria-hidden, so no i18n string needed.
  const ROLE_TOKENS = ['orchestrator', 'research', 'code', 'mcp tools', 'review gate', 'operate'];
  const host = canvas.parentElement; // .hero-bg (-z-10, aria-hidden)
  let overlay: HTMLDivElement | null = null;
  let labelEl: HTMLSpanElement | null = null;
  if (host) {
    overlay = document.createElement('div');
    overlay.className = 'trace-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    labelEl = document.createElement('span');
    labelEl.className = 'trace-label';
    overlay.appendChild(labelEl);
    host.appendChild(overlay);
  }
  let lastLabel = '';
  const showLabel = (text: string, opacity: number, cluster: number) => {
    if (!labelEl) return;
    if (text && text !== lastLabel) {
      labelEl.textContent = text;
      const r = canvas.getBoundingClientRect();
      const c = clusters[cluster];
      // project cluster centre to screen; clamp inside the hero box (the
      // overlay is -z-10, so any residual overlap paints behind the copy)
      const lx = Math.max(14, Math.min(r.width - 150, c.cx * r.width));
      const ly = Math.max(14, Math.min(r.height - 26, (1 - c.cy) * r.height));
      labelEl.style.left = `${lx}px`;
      labelEl.style.top = `${ly}px`;
      lastLabel = text;
    }
    labelEl.style.opacity = String(opacity);
  };

  /* ----- deterministic trace script (offset from a monotonic accumulator,
     never THREE.Clock.getElapsedTime — which resets on resume) ----- */
  interface Hop {
    verb: string;
    cluster: number; // satellite cluster the spoke reaches
    dir: 1 | -1; // 1 = out (orch→role), -1 = in (role→orch)
    hold: number; // dwell after arrival before the next hop
    gate?: boolean; // the review-gate PASS beat
  }
  const HOPS: Hop[] = [
    { verb: 'dispatch', cluster: 1, dir: 1, hold: 0.6 },
    { verb: 'tool_call', cluster: 3, dir: 1, hold: 0.6 },
    { verb: 'result', cluster: 3, dir: -1, hold: 0.6 },
    { verb: 'build', cluster: 2, dir: 1, hold: 0.6 },
    { verb: 'review · PASS', cluster: 4, dir: 1, hold: 0.9, gate: true },
    { verb: 'synthesize', cluster: 5, dir: 1, hold: 0.6 },
  ];
  const TRAVEL = 1.1;
  const FINAL_GAP = 1.0;
  const sched = HOPS.map((h) => ({ h, t0: 0, travelEnd: 0, end: 0 }));
  let acc = 0;
  for (const s of sched) {
    s.t0 = acc;
    s.travelEnd = acc + TRAVEL;
    acc += TRAVEL + s.h.hold;
    s.end = acc;
  }
  const LOOP = acc + FINAL_GAP; // ~11.5s — non-harmonic with the 7s/2.6s CSS loops

  /* ----- loop, poke, lifecycle ----- */
  let raf = 0;
  let running = false;
  let animTime = 0; // monotonic; drives drift + pointer, survives resume
  let traceTime = 0; // monotonic; frozen while poking → seamless resume
  let poking = false;
  let pokeEdge = -1;
  let pokeStart = 0;
  let pokeRelays = 0;
  let lastPokeAt = -1;
  const POKE_DUR = 0.9;
  const POKE_RELAYS = 1;
  const clock = new THREE.Clock();

  const nearestAEdge = (x: number, y: number, exclude: number): number => {
    let best = -1;
    let bd = Infinity;
    for (let e = 0; e < edgeCount; e++) {
      if (e === exclude) continue;
      const dx = edgePos[e * 6] - x;
      const dy = edgePos[e * 6 + 1] - y;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  };

  const pokeAt = (clientX: number, clientY: number) => {
    if (!running) return;
    if (animTime - lastPokeAt < 0.2) return; // throttle
    const r = canvas.getBoundingClientRect();
    const px = (clientX - r.left) / r.width;
    const py = 1 - (clientY - r.top) / r.height;
    // nearest edge A-endpoint (the T=0 departure node)
    let best = -1;
    let bd = Infinity;
    for (let e = 0; e < edgeCount; e++) {
      const dx = edgePos[e * 6] - px;
      const dy = edgePos[e * 6 + 1] - py;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    if (best < 0 || bd > 0.09) return; // dead-zone: no far, disconnected signal
    lastPokeAt = animTime;
    poking = true;
    pokeEdge = best;
    pokeStart = animTime;
    pokeRelays = POKE_RELAYS;
    target.set(px, py);
  };

  const frame = () => {
    if (!running) return;
    const dt = clock.getDelta(); // ~0 right after start() → no jump on resume
    animTime += dt;
    if (!poking) traceTime += dt;
    uniforms.uTime.value = animTime;
    uniforms.uPointer.value.lerp(target, 0.06);

    if (poking) {
      // preempt the trace: the signal answers under the finger, forwards once
      const lp = (animTime - pokeStart) / POKE_DUR;
      if (lp >= 1) {
        if (pokeRelays > 0) {
          const bx = edgePos[pokeEdge * 6 + 3];
          const by = edgePos[pokeEdge * 6 + 4];
          pokeEdge = nearestAEdge(bx, by, pokeEdge);
          pokeStart = animTime;
          pokeRelays--;
        } else {
          poking = false; // trace resumes from its frozen phase, no jump
        }
      }
      if (poking) {
        edgeUniforms.uPulseEdge.value = pokeEdge;
        edgeUniforms.uPulseT.value = Math.min(1, (animTime - pokeStart) / POKE_DUR);
        uniforms.uActiveAmt.value = 0;
        uniforms.uGate.value = 0;
        showLabel('', 0, -1);
      }
    }

    if (!poking) {
      const tt = traceTime % LOOP;
      let hopFound = false;
      for (const s of sched) {
        if (tt >= s.t0 && tt < s.end) {
          hopFound = true;
          const edge = roleSpokes[s.h.cluster][0];
          const eased = sstep((tt - s.t0) / TRAVEL); // 0→1 over travel, 1 in hold
          edgeUniforms.uPulseEdge.value = edge;
          edgeUniforms.uPulseT.value = s.h.dir === 1 ? eased : 1 - eased;
          const activeNode = s.h.dir === 1 ? s.h.cluster : 0;
          // arrival bloom: ramp ~220ms after arrival, decay ~520ms
          const ta = tt - s.travelEnd;
          let amt = 0;
          if (ta >= 0) amt = ta < 0.22 ? ta / 0.22 : Math.max(0, 1 - (ta - 0.22) / 0.52);
          uniforms.uActiveNode.value = activeNode;
          uniforms.uActiveAmt.value = bloomOn ? amt : 0;
          uniforms.uGate.value = bloomOn && s.h.gate && ta >= 0 ? 1 : 0;
          showLabel(ROLE_TOKENS[activeNode], s.h.gate ? 0.7 : 0.6, activeNode);
          break;
        }
      }
      if (!hopFound) {
        // quiet gap before the loop restarts — let the eye rest
        edgeUniforms.uPulseEdge.value = -1;
        uniforms.uActiveAmt.value = 0;
        uniforms.uGate.value = 0;
        showLabel('', 0, -1);
      }
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  const section = canvas.closest('section');
  const onClick = (e: MouseEvent) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('a,button,[role="button"],input,label,summary')) return; // CTAs stay clean
    pokeAt(e.clientX, e.clientY);
  };
  section?.addEventListener('click', onClick, { passive: true });

  const handle: SceneHandle = {
    pause() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resume() {
      if (running) return;
      running = true;
      clock.start(); // resets Clock.elapsedTime — harmless, we use getDelta()
      raf = requestAnimationFrame(frame);
    },
    setTheme() {
      uniforms.uClay.value = cssColor('--su-clay');
      uniforms.uBright.value = cssColor('--su-clay-bright');
    },
    poke(clientX: number, clientY: number) {
      pokeAt(clientX, clientY);
    },
    destroy() {
      this.pause();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      section?.removeEventListener('click', onClick);
      overlay?.remove();
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
