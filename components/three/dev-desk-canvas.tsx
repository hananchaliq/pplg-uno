'use client';

import * as React from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Volume2, VolumeX, Sparkles, Keyboard } from 'lucide-react';

const KEY_LABELS = [
  'ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-',
  'TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[',
  'CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', 'ENT',
  'SHF', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'UP',
  'CTRL', 'ALT', 'CMD', 'SPACE', 'SPACE', 'SPACE', 'FN', 'LEFT', 'DOWN', 'RGHT', 'DEL', 'PG',
];

const CODE_SNIPPETS = [
  [
    '// app/(site)/page.tsx — XII PPLG 1',
    'export default async function ClassHome() {',
    '  const students = await getClassRoster(22);',
    '  const schedule = getActiveScheduleWIB();',
    '  return <TeamLanyardRail items={students} />;',
    '}',
  ],
  [
    '// lib/garden-engine.ts — Botanical AI',
    'const plan = await generateGardenLayout({',
    '  style: "Tropis Rindang",',
    '  model: "gemini-nano-banana-2.1",',
    '  zone: "Teras Lab RPL 1",',
    '});',
  ],
  [
    '// game/loop.ts — PPLG Interactive',
    'function stepPhysics(dt: number) {',
    '  player.velocity.lerp(targetVel, 1 - Math.exp(-12 * dt));',
    '  instancedKeys.computeBoundingSphere();',
    '  renderer.render(scene, camera);',
    '}',
  ],
];

function playKeyClickSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.045);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 100);
  } catch {
    // Ignore audio context restriction
  }
}

export function DevDeskHeroCanvas() {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [lastKeyPressed, setLastKeyPressed] = React.useState<string>('XII PPLG 1');
  const [snippetIndex, setSnippetIndex] = React.useState(0);
  const [konamiActive, setKonamiActive] = React.useState(false);
  const [hudCollapsed, setHudCollapsed] = React.useState(false);

  const soundEnabledRef = React.useRef(false);
  const snippetIndexRef = React.useRef(0);

  React.useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    snippetIndexRef.current = snippetIndex;
  }, [soundEnabled, snippetIndex]);

  const triggerKeyRef = React.useRef<(label: string) => void>(() => {});

  React.useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = Math.max(320, container.clientWidth);
    const height = Math.max(320, container.clientHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xeef0f8, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 8.8);
    camera.lookAt(0, 0.2, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Lighting
    const hemiLight = new THREE.HemisphereLight(0xdde6ff, 0xf7dfc6, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.65);
    keyLight.position.set(5, 8, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 22;
      const d = 6;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6e78e8, 0.9);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Root Assembly Group
    const assembly = new THREE.Group();
    scene.add(assembly);

    // Contact shadow grounding disc
    const shadowGeo = new THREE.CircleGeometry(4.6, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x3c468c,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const contactDisc = new THREE.Mesh(shadowGeo, shadowMat);
    contactDisc.rotation.x = -Math.PI / 2;
    contactDisc.position.y = -1.65;
    scene.add(contactDisc);

    // 1. MECHANICAL KEYBOARD (60-key InstancedMesh + Aluminum Case + Plate)
    const keyboardGroup = new THREE.Group();
    keyboardGroup.position.set(-0.9, -0.55, 1.0);
    keyboardGroup.rotation.set(0.28, 0.22, -0.04);
    assembly.add(keyboardGroup);

    const caseGeo = new THREE.BoxGeometry(3.85, 0.24, 1.48);
    const caseMat = new THREE.MeshStandardMaterial({
      color: 0xe6eaf6,
      roughness: 0.32,
      metalness: 0.45,
    });
    const kbCase = new THREE.Mesh(caseGeo, caseMat);
    kbCase.position.y = -0.08;
    kbCase.receiveShadow = true;
    keyboardGroup.add(kbCase);

    const plateGeo = new THREE.BoxGeometry(3.68, 0.06, 1.32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x8e97e6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const kbPlate = new THREE.Mesh(plateGeo, plateMat);
    kbPlate.position.y = 0.05;
    keyboardGroup.add(kbPlate);

    const keyRows = 5;
    const keyCols = 12;
    const totalKeys = keyRows * keyCols; // 60 keys
    const keycapGeo = new THREE.BoxGeometry(0.25, 0.14, 0.22);
    const keycapMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.1,
    });
    const keyInstanced = new THREE.InstancedMesh(keycapGeo, keycapMat, totalKeys);
    keyInstanced.castShadow = !isSoftwareGl;
    keyInstanced.receiveShadow = !isSoftwareGl;
    keyboardGroup.add(keyInstanced);

    const keyBasePositions: Array<{ x: number; y: number; z: number }> = [];
    const keyPressOffsets = new Float32Array(totalKeys);
    const paletteColors = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#DDE0FA'),
      new THREE.Color('#6E78E8'),
      new THREE.Color('#3FB8A5'),
      new THREE.Color('#F0A04B'),
      new THREE.Color('#E0709A'),
    ];

    const dummyMat = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyQuat = new THREE.Quaternion();
    const dummyScale = new THREE.Vector3(1, 1, 1);

    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        const idx = r * keyCols + c;
        const x = (c - (keyCols - 1) / 2) * 0.295;
        const z = (r - (keyRows - 1) / 2) * 0.255;
        const y = 0.14;
        keyBasePositions.push({ x, y, z });
        dummyPos.set(x, y, z);
        dummyMat.compose(dummyPos, dummyQuat, dummyScale);
        keyInstanced.setMatrixAt(idx, dummyMat);

        if (idx === 0 || idx === 35) {
          keyInstanced.setColorAt(idx, paletteColors[4]);
        } else if (c === 0 || c === keyCols - 1) {
          keyInstanced.setColorAt(idx, paletteColors[2]);
        } else if (r === keyRows - 1 && c >= 3 && c <= 7) {
          keyInstanced.setColorAt(idx, paletteColors[3]);
        } else {
          keyInstanced.setColorAt(idx, paletteColors[idx % 2]);
        }
      }
    }
    keyInstanced.instanceMatrix.needsUpdate = true;
    if (keyInstanced.instanceColor) keyInstanced.instanceColor.needsUpdate = true;
    keyInstanced.computeBoundingSphere();

    // 2. GAMEPAD CONTROLLER (Composite Group: Grips, Body, Analog Sticks, D-Pad, Chart Buttons)
    const gamepadGroup = new THREE.Group();
    gamepadGroup.position.set(2.15, -0.25, 0.85);
    gamepadGroup.rotation.set(0.35, -0.38, 0.12);
    assembly.add(gamepadGroup);

    const padCoreGeo = new THREE.BoxGeometry(1.45, 0.26, 0.82);
    const padBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf4f6fc,
      roughness: 0.35,
      metalness: 0.15,
    });
    const padCore = new THREE.Mesh(padCoreGeo, padBodyMat);
    gamepadGroup.add(padCore);

    const gripGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.95, 16);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0xdde0fa,
      roughness: 0.65,
      metalness: 0.1,
    });
    const leftGrip = new THREE.Mesh(gripGeo, gripMat);
    leftGrip.rotation.x = Math.PI / 2.2;
    leftGrip.rotation.z = 0.24;
    leftGrip.position.set(-0.66, -0.04, 0.22);
    gamepadGroup.add(leftGrip);

    const rightGrip = new THREE.Mesh(gripGeo, gripMat);
    rightGrip.rotation.x = Math.PI / 2.2;
    rightGrip.rotation.z = -0.24;
    rightGrip.position.set(0.66, -0.04, 0.22);
    gamepadGroup.add(rightGrip);

    const stickGeo = new THREE.CylinderGeometry(0.14, 0.08, 0.18, 16);
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0x232956,
      roughness: 0.4,
      metalness: 0.3,
    });
    const leftStick = new THREE.Mesh(stickGeo, stickMat);
    leftStick.position.set(-0.34, 0.18, 0.14);
    gamepadGroup.add(leftStick);

    const rightStick = new THREE.Mesh(stickGeo, stickMat);
    rightStick.position.set(0.26, 0.18, 0.18);
    gamepadGroup.add(rightStick);

    const btnColors = [0x6e78e8, 0x3fb8a5, 0xf0a04b, 0xe0709a];
    const btnOffsets = [
      [0.48, 0.16, -0.2],
      [0.62, 0.16, -0.06],
      [0.48, 0.16, 0.08],
      [0.34, 0.16, -0.06],
    ];
    const btnGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12);
    btnOffsets.forEach(([bx, by, bz], i) => {
      const bMat = new THREE.MeshStandardMaterial({
        color: btnColors[i],
        roughness: 0.25,
        metalness: 0.2,
      });
      const btn = new THREE.Mesh(btnGeo, bMat);
      btn.position.set(bx, by, bz);
      gamepadGroup.add(btn);
    });

    // 3. PROCESSOR CHIP (Die + Heatspreader + 100 Gold Pins InstancedMesh)
    const chipGroup = new THREE.Group();
    chipGroup.position.set(-2.35, 0.95, -0.45);
    chipGroup.rotation.set(0.45, 0.52, -0.18);
    assembly.add(chipGroup);

    const substrateGeo = new THREE.BoxGeometry(1.3, 0.08, 1.3);
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x1e564c,
      roughness: 0.45,
      metalness: 0.3,
    });
    const substrate = new THREE.Mesh(substrateGeo, substrateMat);
    chipGroup.add(substrate);

    const ihsGeo = new THREE.BoxGeometry(0.92, 0.12, 0.92);
    const ihsMat = new THREE.MeshStandardMaterial({
      color: 0xd8deec,
      roughness: 0.18,
      metalness: 0.88,
    });
    const ihs = new THREE.Mesh(ihsGeo, ihsMat);
    ihs.position.y = 0.09;
    chipGroup.add(ihs);

    const pinGeo = new THREE.BoxGeometry(0.035, 0.09, 0.035);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xf0a04b,
      roughness: 0.22,
      metalness: 0.92,
    });
    const pinInstanced = new THREE.InstancedMesh(pinGeo, pinMat, 100);
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const idx = r * 10 + c;
        dummyPos.set((c - 4.5) * 0.11, -0.08, (r - 4.5) * 0.11);
        dummyMat.compose(dummyPos, dummyQuat, dummyScale);
        pinInstanced.setMatrixAt(idx, dummyMat);
      }
    }
    pinInstanced.instanceMatrix.needsUpdate = true;
    pinInstanced.computeBoundingSphere();
    chipGroup.add(pinInstanced);

    // 4. FLOATING GLASS MONITOR WITH LIVE CODE CANVAS TEXTURE
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0.25, 1.15, -0.65);
    monitorGroup.rotation.set(0.08, -0.14, 0);
    assembly.add(monitorGroup);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 320;
    const screenCtx = screenCanvas.getContext('2d');
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    function drawCodeScreen(activeIdx: number, highlightKey: string) {
      if (!screenCtx) return;
      screenCtx.fillStyle = '#111528';
      screenCtx.fillRect(0, 0, 512, 320);

      // Top window chrome
      screenCtx.fillStyle = '#1C223E';
      screenCtx.fillRect(0, 0, 512, 38);
      const dots = ['#E0709A', '#F0A04B', '#3FB8A5'];
      dots.forEach((col, i) => {
        screenCtx.fillStyle = col;
        screenCtx.beginPath();
        screenCtx.arc(22 + i * 18, 19, 5.5, 0, Math.PI * 2);
        screenCtx.fill();
      });

      screenCtx.fillStyle = '#A4AAC0';
      screenCtx.font = '600 12px ui-monospace, monospace';
      screenCtx.fillText(`XII-PPLG-1 // STUDIO [${highlightKey}]`, 92, 23);

      const lines = CODE_SNIPPETS[activeIdx % CODE_SNIPPETS.length] || CODE_SNIPPETS[0];
      screenCtx.font = '500 14px ui-monospace, monospace';
      lines.forEach((line, idx) => {
        screenCtx.fillStyle = idx === 0 ? '#6E78E8' : idx === 2 ? '#3FB8A5' : '#EEF0F8';
        screenCtx.fillText(line, 24, 78 + idx * 34);
      });

      // Bottom status bar
      screenCtx.fillStyle = '#1B2444';
      screenCtx.fillRect(0, 284, 512, 36);
      screenCtx.fillStyle = '#54CEBA';
      screenCtx.font = '600 11px ui-monospace, monospace';
      screenCtx.fillText('BUILD: PASS · 22 SISWA · CLICK MONITOR TO SWITCH SNIPPET', 20, 306);

      screenTex.needsUpdate = true;
    }

    drawCodeScreen(0, 'READY');

    const glassFrameGeo = new THREE.BoxGeometry(3.55, 2.25, 0.12);
    const glassFrameMat = new THREE.MeshPhysicalMaterial({
      color: 0xdde6ff,
      roughness: 0.15,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.82,
      transparent: true,
      opacity: isSoftwareGl ? 0.55 : 1,
      ior: 1.48,
      thickness: 0.6,
    });
    const glassFrame = new THREE.Mesh(glassFrameGeo, glassFrameMat);
    monitorGroup.add(glassFrame);

    const displayPlaneGeo = new THREE.PlaneGeometry(3.25, 1.98);
    const displayPlaneMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const displayPlane = new THREE.Mesh(displayPlaneGeo, displayPlaneMat);
    displayPlane.position.z = 0.07;
    monitorGroup.add(displayPlane);

    // 5. ORBIT RING + BOTANICAL / CODE TOKENS
    const orbitGroup = new THREE.Group();
    orbitGroup.position.set(0, 0.35, 0);
    orbitGroup.rotation.set(0.32, 0, -0.18);
    assembly.add(orbitGroup);

    const ringGeo = new THREE.TorusGeometry(3.45, 0.018, 12, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x6e78e8,
      roughness: 0.3,
      metalness: 0.6,
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2;
    orbitGroup.add(orbitRing);

    const tokenColors = [0x6e78e8, 0x3fb8a5, 0xf0a04b, 0xe0709a, 0x4fa3e0];
    const tokenMeshes: THREE.Mesh[] = [];
    const tokenGeo = new THREE.OctahedronGeometry(0.14, 0);
    for (let i = 0; i < 5; i++) {
      const tMat = new THREE.MeshStandardMaterial({
        color: tokenColors[i],
        roughness: 0.25,
        metalness: 0.5,
      });
      const tMesh = new THREE.Mesh(tokenGeo, tMat);
      const angle = (i / 5) * Math.PI * 2;
      tMesh.position.set(Math.cos(angle) * 3.45, 0, Math.sin(angle) * 3.45);
      orbitGroup.add(tMesh);
      tokenMeshes.push(tMesh);
    }

    // 6. AMBIENT DUST PARTICLES (Points)
    const particleCount = isSoftwareGl ? 120 : 280;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6e78e8,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Trigger keycap press animation
    const triggerKeyByLabel = (rawKey: string) => {
      const normalized = rawKey.toUpperCase();
      let idx = KEY_LABELS.findIndex((k) => k === normalized);
      if (idx < 0) {
        idx = Math.abs(rawKey.charCodeAt(0) || 0) % totalKeys;
      }
      keyPressOffsets[idx] = -0.11;
      setLastKeyPressed(normalized.slice(0, 8));
      drawCodeScreen(snippetIndexRef.current, normalized.slice(0, 8));
      if (soundEnabledRef.current) {
        playKeyClickSound();
      }
    };
    triggerKeyRef.current = triggerKeyByLabel;

    // Pointer & Keyboard listeners
    let targetMouseX = 0;
    let targetMouseY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      targetMouseY = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
    };

    const raycaster = new THREE.Raycaster();
    const pointerVec = new THREE.Vector2();
    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerVec.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      pointerVec.y = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      raycaster.setFromCamera(pointerVec, camera);

      const monitorHit = raycaster.intersectObject(displayPlane, false);
      if (monitorHit.length > 0) {
        const nextIdx = (snippetIndexRef.current + 1) % CODE_SNIPPETS.length;
        snippetIndexRef.current = nextIdx;
        setSnippetIndex(nextIdx);
        drawCodeScreen(nextIdx, 'SNIPPET');
        return;
      }

      const keyHits = raycaster.intersectObject(keyInstanced, false);
      if (keyHits.length > 0 && typeof keyHits[0].instanceId === 'number') {
        const id = keyHits[0].instanceId;
        keyPressOffsets[id] = -0.12;
        const label = KEY_LABELS[id] || `KEY-${id}`;
        setLastKeyPressed(label);
        drawCodeScreen(snippetIndexRef.current, label);
        if (soundEnabledRef.current) playKeyClickSound();
      }
    };

    // Konami Easter Egg tracker
    const konamiSeq = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a',
    ];
    let konamiPos = 0;

    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === konamiSeq[konamiPos]?.toLowerCase()) {
        konamiPos++;
        if (konamiPos === konamiSeq.length) {
          konamiPos = 0;
          setKonamiActive(true);
          for (let i = 0; i < totalKeys; i++) {
            keyPressOffsets[i] = -0.14;
          }
          window.setTimeout(() => setKonamiActive(false), 4500);
        }
      } else {
        konamiPos = 0;
      }
      triggerKeyByLabel(e.key === ' ' ? 'SPACE' : e.key);
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onWindowKeyDown);

    const onResize = () => {
      if (!container) return;
      const w = Math.max(300, container.clientWidth);
      const h = Math.max(300, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // IntersectionObserver pause when offscreen
    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]) isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    // Animation loop with Software WebGL pacing
    let lastTime = performance.now();
    const startTime = lastTime;
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      if (isVisible) {
        // Smooth camera parallax
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetMouseX * 0.9, 4, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 4.2 + targetMouseY * 0.5, 4, dt);
        camera.lookAt(0, 0.25, 0);

        // Gentle floating motion
        keyboardGroup.position.y = -0.55 + Math.sin(elapsed * 1.4) * 0.05;
        gamepadGroup.position.y = -0.25 + Math.cos(elapsed * 1.6) * 0.07;
        chipGroup.position.y = 0.95 + Math.sin(elapsed * 1.9 + 1) * 0.06;
        chipGroup.rotation.y = 0.52 + elapsed * 0.18;
        monitorGroup.position.y = 1.15 + Math.sin(elapsed * 1.2) * 0.05;
        orbitGroup.rotation.y = elapsed * 0.25;

        // Analog sticks follow cursor
        leftStick.rotation.z = THREE.MathUtils.damp(leftStick.rotation.z, -targetMouseX * 0.35, 8, dt);
        leftStick.rotation.x = THREE.MathUtils.damp(leftStick.rotation.x, targetMouseY * 0.35, 8, dt);
        rightStick.rotation.z = THREE.MathUtils.damp(rightStick.rotation.z, targetMouseX * 0.25, 8, dt);

        // Recover keycap springs
        let matrixChanged = false;
        for (let i = 0; i < totalKeys; i++) {
          if (Math.abs(keyPressOffsets[i]) > 0.001) {
            keyPressOffsets[i] = THREE.MathUtils.damp(keyPressOffsets[i], 0, 14, dt);
            const base = keyBasePositions[i];
            dummyPos.set(base.x, base.y + keyPressOffsets[i], base.z);
            dummyMat.compose(dummyPos, dummyQuat, dummyScale);
            keyInstanced.setMatrixAt(i, dummyMat);
            matrixChanged = true;
          }
        }
        if (matrixChanged) {
          keyInstanced.instanceMatrix.needsUpdate = true;
        }

        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      io.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onWindowKeyDown);
      window.removeEventListener('resize', onResize);
      screenTex.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#DDE2F6] via-[#E8ECF9] to-[#D4EFE7] dark:border-white/15 dark:from-[#12162C] dark:via-[#171C36] dark:to-[#112629]">
      {/* Stylized Architectural Isometric SVG Underlay (Resilient fallback & depth backdrop) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 600 420"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-90"
      >
        <defs>
          <radialGradient id="heroGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#6E78E8" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#3FB8A5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="190" r="210" fill="url(#heroGlow)" />
        <ellipse cx="300" cy="215" rx="225" ry="72" fill="none" stroke="#6E78E8" strokeOpacity="0.28" strokeDasharray="6 8" strokeWidth="1.5" />
        {/* Floating Code Monitor Backdrop */}
        <g transform="translate(175, 42)">
          <rect width="260" height="145" rx="16" fill="#121629" stroke="#848DF2" strokeWidth="2" />
          <rect x="0" y="0" width="260" height="24" rx="12" fill="#1E2544" />
          <circle cx="16" cy="12" r="4" fill="#E0709A" />
          <circle cx="30" cy="12" r="4" fill="#F0A04B" />
          <circle cx="44" cy="12" r="4" fill="#3FB8A5" />
          <text x="64" y="16" fontFamily="monospace" fontSize="9" fill="#A4AAC0">
            XII-PPLG-1 // STUDIO [{lastKeyPressed}]
          </text>
          {(CODE_SNIPPETS[snippetIndex % CODE_SNIPPETS.length] || CODE_SNIPPETS[0]).map((line, idx) => (
            <text
              key={idx}
              x="16"
              y={46 + idx * 17}
              fontFamily="monospace"
              fontSize="9.5"
              fill={idx === 0 ? '#848DF2' : idx === 2 ? '#54CEBA' : '#EEF0F8'}
            >
              {line}
            </text>
          ))}
        </g>
        {/* Mechanical Keyboard Deck Silhouette */}
        <g transform="translate(115, 212)">
          <rect width="250" height="92" rx="14" fill="#FFFFFF" fillOpacity="0.82" stroke="#6E78E8" strokeOpacity="0.4" strokeWidth="1.5" />
          {Array.from({ length: 24 }).map((_, i) => {
            const col = i % 8;
            const row = Math.floor(i / 8);
            const colors = ['#6E78E8', '#3FB8A5', '#DDE0FA', '#F0A04B', '#E0709A'];
            return (
              <rect
                key={i}
                x={14 + col * 28}
                y={14 + row * 22}
                width="22"
                height="16"
                rx="4"
                fill={colors[i % colors.length]}
                fillOpacity="0.8"
              />
            );
          })}
        </g>
        {/* Gamepad & Processor Nodes */}
        <g transform="translate(395, 215)">
          <rect width="110" height="68" rx="28" fill="#FFFFFF" fillOpacity="0.85" stroke="#3FB8A5" strokeWidth="1.5" />
          <circle cx="34" cy="34" r="12" fill="#232956" />
          <circle cx="78" cy="26" r="5" fill="#6E78E8" />
          <circle cx="88" cy="34" r="5" fill="#3FB8A5" />
          <circle cx="78" cy="42" r="5" fill="#F0A04B" />
          <circle cx="68" cy="34" r="5" fill="#E0709A" />
        </g>
        <g transform="translate(68, 92)">
          <rect width="76" height="76" rx="12" fill="#1E564C" stroke="#F0A04B" strokeWidth="1.5" />
          <rect x="14" y="14" width="48" height="48" rx="6" fill="#D8DEEC" />
          <text x="38" y="42" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#0B0D14">
            PPLG CPU
          </text>
        </g>
      </svg>

      {/* Dedicated WebGL Mount Container */}
      <div
        ref={mountRef}
        data-testid="hero-3d-canvas"
        aria-label="3D Interaktif Dev Desk XII PPLG 1: Keyboard Mekanikal, Gamepad, Prosesor, dan Monitor Kode"
        className="relative z-10 h-full w-full cursor-grab active:cursor-grabbing"
      />

      {konamiActive && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-6 top-4 z-20 rounded-2xl bg-[#111528]/90 px-4 py-2.5 text-center font-mono text-xs text-white"
        >
          KONAMI CODE AKTIF · KEYCAP WAVE XII PPLG 1!
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion, No backdrop-filter over WebGL) */}
      <div className="pointer-events-auto absolute bottom-3 left-1/2 z-20 w-[94%] max-w-[540px] -translate-x-1/2">
        <div className="flex justify-center pb-1">
          <button
            type="button"
            onClick={() => setHudCollapsed((c) => !c)}
            className="rounded-full bg-[#0B0D14]/85 px-3 py-1 font-mono text-[11px] text-white transition hover:bg-[#0B0D14]"
          >
            {hudCollapsed ? '▴ Tampilkan Kontrol 3D' : '▾ Sembunyikan Kontrol'}
          </button>
        </div>

        {!hudCollapsed && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/25 bg-[#121629]/90 px-3.5 py-2 text-xs text-white">
            <div className="flex items-center gap-2">
              <Keyboard className="size-3.5 text-[#848DF2]" />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Key: {lastKeyPressed}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {['W', 'A', 'S', 'D', 'SPACE'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => triggerKeyRef.current(k)}
                  className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] font-medium text-white transition hover:bg-white/25 active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = (snippetIndex + 1) % CODE_SNIPPETS.length;
                  setSnippetIndex(next);
                  triggerKeyRef.current('CODE');
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-[#6E78E8] px-2.5 py-1 font-mono text-[10px] font-medium text-white transition hover:opacity-90"
              >
                <Sparkles className="size-3" />
                Layar ({snippetIndex + 1}/3)
              </button>

              <button
                type="button"
                aria-label={soundEnabled ? 'Matikan suara keycap' : 'Nyalakan suara keycap'}
                onClick={() => setSoundEnabled((s) => !s)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] text-white transition hover:bg-white/20"
              >
                {soundEnabled ? <Volume2 className="size-3.5 text-[#54CEBA]" /> : <VolumeX className="size-3.5 text-white/70" />}
                <span>{soundEnabled ? 'SFX On' : 'SFX Off'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
