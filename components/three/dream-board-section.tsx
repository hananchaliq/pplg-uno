'use client';

import * as React from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import {
  StudentRecord,
  DREAM_PAPER_PALETTE,
} from '@/lib/class-data';
import {
  computeDreamBoardLayout,
  DreamNoteBoardPose,
} from '@/lib/class-logic';
import {
  Sparkles,
  Pin,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Heart,
  FileText,
  Shuffle,
} from 'lucide-react';

interface DreamBoardSectionProps {
  students: StudentRecord[];
}

function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
  smoothness = 4
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const eps = 0.00001;
  const r = Math.max(eps, radius - eps);
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, height - r * 2, eps, Math.PI, Math.PI / 2, true);
  shape.absarc(width - r * 2, height - r * 2, eps, Math.PI / 2, 0, true);
  shape.absarc(width - r * 2, eps, eps, 0, -Math.PI / 2, true);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, depth - radius * 2),
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: r,
    bevelThickness: radius,
    curveSegments: smoothness,
  });
  geo.center();
  return geo;
}

function createBoardSurfaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Soft matte cork-glass / whiteboard gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 288);
    grad.addColorStop(0, '#F7F8FC');
    grad.addColorStop(0.5, '#EFF2FA');
    grad.addColorStop(1, '#E8ECF8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 288);

    // Subtle studio dot grid
    ctx.fillStyle = 'rgba(110, 120, 232, 0.09)';
    for (let x = 16; x < 512; x += 16) {
      for (let y = 16; y < 288; y += 16) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Fine grain noise for matte surface reflection
    for (let i = 0; i < 1600; i++) {
      const nx = (i * 97) % 512;
      const ny = (i * 53) % 288;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(15,20,40,0.025)';
      ctx.fillRect(nx, ny, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createDreamNoteTextTexture(
  rollNo: number,
  name: string,
  dreamTitle: string,
  role: string,
  paperHex: string,
  pinHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Clear background (transparent so 3D curved paper mesh color shines through)
    ctx.clearRect(0, 0, 512, 384);

    // Subtle ruled paper lines
    ctx.strokeStyle = 'rgba(11, 13, 20, 0.06)';
    ctx.lineWidth = 2;
    for (let y = 118; y < 340; y += 44) {
      ctx.beginPath();
      ctx.moveTo(34, y);
      ctx.lineTo(478, y);
      ctx.stroke();
    }

    // Top-left roll number & nickname in JetBrains Mono
    const padded = String(rollNo).padStart(2, '0');
    ctx.fillStyle = '#474D66';
    ctx.font = '700 26px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(`#${padded} · ${name}`, 36, 76);

    // Subtle colored accent bar under header
    ctx.fillStyle = pinHex;
    ctx.fillRect(36, 92, 92, 6);

    // Wrap dream title in Plus Jakarta Sans Bold
    ctx.fillStyle = '#0B0D14';
    ctx.font = '800 36px "Plus Jakarta Sans", system-ui, sans-serif';
    const words = dreamTitle.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const w of words) {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      if (ctx.measureText(testLine).width > 435 && currentLine) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    lines.slice(0, 3).forEach((line, idx) => {
      ctx.fillText(line, 36, 158 + idx * 46);
    });

    // Bottom footer role badge
    ctx.fillStyle = 'rgba(11, 13, 20, 0.56)';
    ctx.font = '600 21px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(role.toUpperCase(), 36, 344);

    // Subtle paper grain corner fold mark
    ctx.fillStyle = 'rgba(11, 13, 20, 0.08)';
    ctx.beginPath();
    ctx.moveTo(452, 384);
    ctx.lineTo(512, 324);
    ctx.lineTo(512, 384);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Applies realistic 3D paper curl/bend + dynamic wind wave to a 16x16 segmented PlaneGeometry.
 */
function deformPaperGeometry(
  geo: THREE.PlaneGeometry,
  basePositions: Float32Array,
  curlAmount: number,
  waveAmount: number,
  timeSec: number,
  seedPhase: number
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const count = pos.count;

  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    const x = basePositions[ix];
    const y = basePositions[ix + 1];

    // Normalized coordinates [-1..1]
    const nx = x / 0.9;
    const ny = y / 0.65;

    // Top center stays pinned near z = 0; bottom corners curl outward (+Z)
    const distFromTop = Math.max(0, (1 - ny) * 0.5); // 0 at top, 1 at bottom
    const cornerFactor = Math.pow(distFromTop, 1.85) * (0.65 + 0.35 * Math.abs(nx));
    const asymmetry = nx * 0.025 * distFromTop;

    // Subtle wind wave when hovered or zoomed
    const windWave =
      Math.sin(timeSec * 5.2 + seedPhase + nx * 2.1 - ny * 1.8) *
      waveAmount *
      distFromTop;

    arr[ix] = x;
    arr[ix + 1] = y;
    arr[ix + 2] = cornerFactor * curlAmount + asymmetry + windWave;
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

export function DreamBoardSection({ students }: DreamBoardSectionProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const poses = React.useMemo(() => computeDreamBoardLayout(students), [students]);

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = React.useState<number | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = React.useState<{ x: number; y: number } | null>(
    null
  );
  const [zoomColorOverride, setZoomColorOverride] = React.useState<Record<string, string>>({});

  // Refs synced for the 60fps Three.js loop
  const hoveredIndexRef = React.useRef<number | null>(null);
  const zoomedIndexRef = React.useRef<number | null>(null);
  const pointerTiltRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const updatePaperColorRef = React.useRef<(studentId: string, hex: string) => void>(() => {});

  React.useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
  }, [hoveredIndex]);

  React.useEffect(() => {
    zoomedIndexRef.current = zoomedIndex;
  }, [zoomedIndex]);

  // Keyboard navigation when a 3D paper is zoomed (Escape, ArrowLeft, ArrowRight)
  React.useEffect(() => {
    if (zoomedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedIndex(null);
      } else if (e.key === 'ArrowRight') {
        setZoomedIndex((prev) => (prev === null ? 0 : (prev + 1) % poses.length));
      } else if (e.key === 'ArrowLeft') {
        setZoomedIndex((prev) =>
          prev === null ? 0 : (prev - 1 + poses.length) % poses.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedIndex, poses.length]);

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

    const segs = isSoftwareGl ? 10 : 16;
    const width = container.clientWidth || 960;
    const height = container.clientHeight || 580;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, -0.12, 12.65);
    camera.lookAt(0, -0.12, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.position = 'relative';
    renderer.domElement.style.zIndex = '2';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const disposableTextures: THREE.Texture[] = [];

    // Studio Lighting (Key, Fill, Rim, Ambient)
    const ambient = new THREE.AmbientLight(0xf6f7ff, 1.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(5.5, 7.5, 9.0);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdde0fa, 0.95);
    fillLight.position.set(-7.0, 2.5, 6.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xcfebe2, 0.85);
    rimLight.position.set(0, -6.0, 5.0);
    scene.add(rimLight);

    // Root Classroom Board Group
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // 1. THE CLASSROOM BOARD (Rounded 16:9 Frame + Matte Surface + Bottom Tray)
    const outerFrameGeo = createRoundedBoxGeometry(13.6, 7.6, 0.34, 0.22, isSoftwareGl ? 2 : 4);
    disposableGeometries.push(outerFrameGeo);
    const outerFrameMat = new THREE.MeshStandardMaterial({
      color: 0xe6dec8, // Warm light ash wood / pastel alloy frame
      roughness: 0.4,
      metalness: 0.12,
    });
    disposableMaterials.push(outerFrameMat);
    const outerFrameMesh = new THREE.Mesh(outerFrameGeo, outerFrameMat);
    outerFrameMesh.position.set(0, 0, -0.16);
    outerFrameMesh.receiveShadow = true;
    boardGroup.add(outerFrameMesh);

    // Inner Metallic Bevel Trim
    const innerTrimGeo = createRoundedBoxGeometry(13.15, 7.15, 0.36, 0.16, 2);
    disposableGeometries.push(innerTrimGeo);
    const innerTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd5daf0,
      roughness: 0.35,
      metalness: 0.28,
    });
    disposableMaterials.push(innerTrimMat);
    const innerTrimMesh = new THREE.Mesh(innerTrimGeo, innerTrimMat);
    innerTrimMesh.position.set(0, 0, -0.14);
    boardGroup.add(innerTrimMesh);

    // Matte Whiteboard / Cork-Glass Surface
    const surfaceTex = createBoardSurfaceTexture();
    disposableTextures.push(surfaceTex);
    const surfaceGeo = new THREE.PlaneGeometry(12.85, 6.85);
    disposableGeometries.push(surfaceGeo);
    const surfaceMat = new THREE.MeshStandardMaterial({
      map: surfaceTex,
      roughness: 0.58,
      metalness: 0.04,
    });
    disposableMaterials.push(surfaceMat);
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.position.set(0, 0, 0.05);
    surfaceMesh.receiveShadow = true;
    boardGroup.add(surfaceMesh);

    // Bottom Marker Tray + Procedural Eraser + 2 Pastel Markers
    const trayGeo = createRoundedBoxGeometry(5.6, 0.22, 0.55, 0.06, 2);
    disposableGeometries.push(trayGeo);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0xd8dcf2,
      roughness: 0.38,
      metalness: 0.3,
    });
    disposableMaterials.push(trayMat);
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0, -3.62, 0.22);
    boardGroup.add(trayMesh);

    // Whiteboard Eraser (Felt bottom + Pastel top handle)
    const eraserTopGeo = createRoundedBoxGeometry(0.95, 0.24, 0.36, 0.05, 2);
    const eraserFeltGeo = createRoundedBoxGeometry(0.95, 0.09, 0.36, 0.02, 2);
    disposableGeometries.push(eraserTopGeo, eraserFeltGeo);
    const eraserTopMat = new THREE.MeshStandardMaterial({
      color: 0x6e78e8,
      roughness: 0.35,
    });
    const eraserFeltMat = new THREE.MeshStandardMaterial({
      color: 0x2c3044,
      roughness: 0.85,
    });
    disposableMaterials.push(eraserTopMat, eraserFeltMat);

    const eraserTop = new THREE.Mesh(eraserTopGeo, eraserTopMat);
    eraserTop.position.set(-1.65, -3.41, 0.28);
    boardGroup.add(eraserTop);

    const eraserFelt = new THREE.Mesh(eraserFeltGeo, eraserFeltMat);
    eraserFelt.position.set(-1.65, -3.51, 0.28);
    boardGroup.add(eraserFelt);

    // 2 Pastel Markers on Tray (Iris & Mint)
    const markerBodyGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.88, 14);
    markerBodyGeo.rotateZ(Math.PI / 2);
    const markerCapGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.26, 14);
    markerCapGeo.rotateZ(Math.PI / 2);
    disposableGeometries.push(markerBodyGeo, markerCapGeo);

    const whiteMarkerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
    });
    const irisCapMat = new THREE.MeshStandardMaterial({
      color: 0x6e78e8,
      roughness: 0.3,
    });
    const mintCapMat = new THREE.MeshStandardMaterial({
      color: 0x3fb8a5,
      roughness: 0.3,
    });
    disposableMaterials.push(whiteMarkerMat, irisCapMat, mintCapMat);

    const marker1Body = new THREE.Mesh(markerBodyGeo, whiteMarkerMat);
    marker1Body.position.set(0.35, -3.45, 0.28);
    const marker1Cap = new THREE.Mesh(markerCapGeo, irisCapMat);
    marker1Cap.position.set(-0.08, -3.45, 0.28);
    boardGroup.add(marker1Body, marker1Cap);

    const marker2Body = new THREE.Mesh(markerBodyGeo, whiteMarkerMat);
    marker2Body.position.set(1.65, -3.45, 0.32);
    marker2Body.rotation.y = 0.06;
    const marker2Cap = new THREE.Mesh(markerCapGeo, mintCapMat);
    marker2Cap.position.set(1.22, -3.45, 0.32);
    boardGroup.add(marker2Body, marker2Cap);

    // 2. 22 3D DREAM NOTES (Segmented PlaneGeometry with Vertex Curl + 3D Pin + 3D Text Layer)
    interface Note3DInstance {
      index: number;
      student: StudentRecord;
      pose: DreamNoteBoardPose;
      group: THREE.Group;
      paperMesh: THREE.Mesh;
      paperMat: THREE.MeshStandardMaterial;
      paperGeo: THREE.PlaneGeometry;
      basePositions: Float32Array;
      textMesh: THREE.Mesh;
      rimMesh: THREE.Mesh;
      rimMat: THREE.MeshBasicMaterial;
      pinGroup: THREE.Group;
      shadowMat: THREE.MeshBasicMaterial;
      // Animated state
      currPos: THREE.Vector3;
      currRot: THREE.Euler;
      currScale: number;
      currCurl: number;
      currWave: number;
      currPinOffset: number;
      currRimOpacity: number;
    }

    const noteInstances: Note3DInstance[] = [];
    const pickablePaperMeshes: THREE.Mesh[] = [];

    const noteW = 1.72;
    const noteH = 1.24;

    // Shared Pin Geometries
    const pinNeedleGeo = new THREE.CylinderGeometry(0.022, 0.008, 0.18, 12);
    pinNeedleGeo.rotateX(Math.PI / 2 - 0.18);
    const pinHeadGeo = new THREE.SphereGeometry(0.095, 16, 16);
    const pinCollarGeo = new THREE.CylinderGeometry(0.06, 0.075, 0.05, 14);
    pinCollarGeo.rotateX(Math.PI / 2 - 0.18);
    disposableGeometries.push(pinNeedleGeo, pinHeadGeo, pinCollarGeo);

    const metalPinMat = new THREE.MeshStandardMaterial({
      color: 0xd0d5e8,
      metalness: 0.75,
      roughness: 0.25,
    });
    disposableMaterials.push(metalPinMat);

    // Soft contact shadow plane behind each note
    const shadowPlaneGeo = new THREE.PlaneGeometry(noteW * 1.04, noteH * 1.04);
    disposableGeometries.push(shadowPlaneGeo);

    poses.forEach((pose, idx) => {
      const student = students.find((s) => s.id === pose.studentId) ?? students[idx];
      if (!student) return;

      const group = new THREE.Group();
      group.position.set(pose.x, pose.y, pose.z);
      group.rotation.set(0, 0, pose.rotZRad);
      boardGroup.add(group);

      // Soft Contact Shadow under paper
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x161b33,
        transparent: true,
        opacity: 0.13,
        depthWrite: false,
      });
      disposableMaterials.push(shadowMat);
      const shadowMesh = new THREE.Mesh(shadowPlaneGeo, shadowMat);
      shadowMesh.position.set(0.04, -0.05, -0.04);
      group.add(shadowMesh);

      // Rim Highlight Halo (visible on Hover & Zoom)
      const rimGeo = new THREE.PlaneGeometry(noteW + 0.12, noteH + 0.12);
      disposableGeometries.push(rimGeo);
      const rimMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(pose.pinColorHex),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      disposableMaterials.push(rimMat);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.set(0, 0, -0.015);
      group.add(rimMesh);

      // 3D Curved Paper Mesh (16x16 segments for vertex curl & wind wave)
      const paperGeo = new THREE.PlaneGeometry(noteW, noteH, segs, segs);
      disposableGeometries.push(paperGeo);
      const basePositions = new Float32Array(
        (paperGeo.attributes.position as THREE.BufferAttribute).array
      );
      deformPaperGeometry(paperGeo, basePositions, 0.14, 0.008, 0, pose.swayPhase);

      const paperMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pose.paperColorHex),
        roughness: 0.68,
        metalness: 0.03,
        side: THREE.DoubleSide,
      });
      disposableMaterials.push(paperMat);

      const paperMesh = new THREE.Mesh(paperGeo, paperMat);
      paperMesh.userData = { noteIndex: idx, studentId: student.id };
      group.add(paperMesh);
      pickablePaperMeshes.push(paperMesh);

      // 3D Text Surface slightly above paper (Z + 0.012) following the paper curvature
      const textTex = createDreamNoteTextTexture(
        student.roll_no,
        student.name,
        student.dream_title,
        student.role,
        pose.paperColorHex,
        pose.pinColorHex
      );
      disposableTextures.push(textTex);

      const textMat = new THREE.MeshBasicMaterial({
        map: textTex,
        transparent: true,
        depthWrite: false,
      });
      disposableMaterials.push(textMat);

      // Share the same deformed geometry so text bends with the 3D paper curl!
      const textMesh = new THREE.Mesh(paperGeo, textMat);
      textMesh.position.set(0, 0, 0.012);
      group.add(textMesh);

      // 3D Glossy Push-Pin at top-center of note
      const pinGroup = new THREE.Group();
      pinGroup.position.set(0, noteH * 0.41, 0.05);

      const pinHeadMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pose.pinColorHex),
        roughness: 0.18,
        metalness: 0.22,
      });
      disposableMaterials.push(pinHeadMat);

      const needleMesh = new THREE.Mesh(pinNeedleGeo, metalPinMat);
      needleMesh.position.set(0, 0, -0.02);
      const collarMesh = new THREE.Mesh(pinCollarGeo, pinHeadMat);
      collarMesh.position.set(0, 0.01, 0.04);
      const headMesh = new THREE.Mesh(pinHeadGeo, pinHeadMat);
      headMesh.position.set(0, 0.025, 0.11);

      pinGroup.add(needleMesh, collarMesh, headMesh);
      group.add(pinGroup);

      noteInstances.push({
        index: idx,
        student,
        pose,
        group,
        paperMesh,
        paperMat,
        paperGeo,
        basePositions,
        textMesh,
        rimMesh,
        rimMat,
        pinGroup,
        shadowMat,
        currPos: new THREE.Vector3(pose.x, pose.y, pose.z),
        currRot: new THREE.Euler(0, 0, pose.rotZRad),
        currScale: 1,
        currCurl: 0.14,
        currWave: 0.008,
        currPinOffset: 0,
        currRimOpacity: 0,
      });
    });

    // Expose live color updater when user clicks "Acak Warna Pastel" in Zoom mode
    updatePaperColorRef.current = (studentId: string, hex: string) => {
      const target = noteInstances.find((n) => n.student.id === studentId);
      if (target) {
        target.paperMat.color.set(hex);
      }
    };

    // Raycasting for Hover & Click on the 22 3D Notes
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const updatePointerAndRaycast = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      pointerTiltRef.current = { x: pointer.x, y: pointer.y };

      // If a paper is currently zoomed, keep focus on it
      if (zoomedIndexRef.current !== null) {
        return;
      }

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickablePaperMeshes, false);
      if (hits.length > 0) {
        const hitIdx = hits[0].object.userData?.noteIndex;
        if (typeof hitIdx === 'number') {
          renderer.domElement.style.cursor = 'pointer';
          if (hoveredIndexRef.current !== hitIdx) {
            hoveredIndexRef.current = hitIdx;
            setHoveredIndex(hitIdx);
          }

          // Project the 3D hovered note position to 2D canvas coordinates for the floating prompt
          const inst = noteInstances[hitIdx];
          if (inst) {
            const worldPos = new THREE.Vector3();
            inst.group.getWorldPosition(worldPos);
            worldPos.y += 0.72;
            worldPos.z += 0.25;
            worldPos.project(camera);
            const sx = ((worldPos.x + 1) / 2) * rect.width;
            const sy = ((-worldPos.y + 1) / 2) * rect.height;
            setHoverScreenPos({
              x: Math.max(110, Math.min(rect.width - 110, sx)),
              y: Math.max(36, Math.min(rect.height - 36, sy)),
            });
          }
          return;
        }
      }

      renderer.domElement.style.cursor = 'grab';
      if (hoveredIndexRef.current !== null) {
        hoveredIndexRef.current = null;
        setHoveredIndex(null);
        setHoverScreenPos(null);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePointerAndRaycast(e.clientX, e.clientY);
    };

    const onPointerLeave = () => {
      pointerTiltRef.current = { x: 0, y: 0 };
      if (hoveredIndexRef.current !== null) {
        hoveredIndexRef.current = null;
        setHoveredIndex(null);
        setHoverScreenPos(null);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickablePaperMeshes, false);
      if (hits.length > 0) {
        const hitIdx = hits[0].object.userData?.noteIndex;
        if (typeof hitIdx === 'number') {
          if (zoomedIndexRef.current === hitIdx) {
            // Clicking the already zoomed 3D paper cycles its pastel color playfully
            const inst = noteInstances[hitIdx];
            if (inst) {
              const randomPalette =
                DREAM_PAPER_PALETTE[Math.floor(Math.random() * DREAM_PAPER_PALETTE.length)];
              inst.paperMat.color.set(randomPalette.hex);
            }
          } else {
            zoomedIndexRef.current = hitIdx;
            setZoomedIndex(hitIdx);
            setHoveredIndex(null);
            setHoverScreenPos(null);
          }
        }
      } else if (zoomedIndexRef.current !== null) {
        // Clicking outside on the dimmed board closes zoom
        zoomedIndexRef.current = null;
        setZoomedIndex(null);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      // Pull camera slightly further back on narrow mobile viewports so all 6 columns fit
      camera.position.z = w < 640 ? 15.2 : 12.65;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();
    window.addEventListener('resize', onResize);

    // Animation Loop (3-State Physics: Idle -> Hover -> Click & Zoom)
    let rafId = 0;
    const startTimeMs = performance.now();
    let prevTimeSec = 0;

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      const elapsedSec = (performance.now() - startTimeMs) * 0.001;
      const dt = Math.min(elapsedSec - prevTimeSec, 0.1);
      prevTimeSec = elapsedSec;
      const lerpFactor = Math.min(1, dt * 8.5);

      const activeHover = hoveredIndexRef.current;
      const activeZoom = zoomedIndexRef.current;
      const tilt = pointerTiltRef.current;

      // Subtle board parallax when in Idle/Hover state
      const targetBoardRotY = activeZoom !== null ? -0.04 : tilt.x * 0.045;
      const targetBoardRotX = activeZoom !== null ? 0.01 : -tilt.y * 0.035;
      boardGroup.rotation.y += (targetBoardRotY - boardGroup.rotation.y) * lerpFactor;
      boardGroup.rotation.x += (targetBoardRotX - boardGroup.rotation.x) * lerpFactor;

      for (let i = 0; i < noteInstances.length; i++) {
        const inst = noteInstances[i];
        const isHovered = activeZoom === null && activeHover === i;
        const isZoomed = activeZoom === i;

        // Compute target 3D transform based on state
        let targetX = inst.pose.x;
        let targetY = inst.pose.y;
        let targetZ = inst.pose.z;
        let targetRotX = 0;
        let targetRotY = 0;
        let targetRotZ = inst.pose.rotZRad;
        let targetScale = 1.0;
        let targetCurl = 0.14;
        let targetWave = 0.008;
        let targetPinOffset = 0;
        let targetRimOpacity = 0;

        if (isZoomed) {
          // STATE 3: Click & Zoom — 3D Paper flies forward to left-center of camera with full margin
          const isMobile = (container.clientWidth || 960) < 768;
          targetX = isMobile ? 0 : -2.15;
          targetY = isMobile ? 1.35 : 0.05;
          targetZ = 3.85;
          targetRotX = -tilt.y * 0.14 + Math.sin(elapsedSec * 2.1) * 0.03;
          targetRotY = 0.18 + tilt.x * 0.18 + Math.cos(elapsedSec * 1.7) * 0.04;
          targetRotZ = -0.025 + Math.sin(elapsedSec * 1.4) * 0.015;
          targetScale = isMobile ? 1.38 : 1.62;
          targetCurl = 0.24;
          targetWave = 0.032;
          targetPinOffset = 0.36; // Pin detaches upward!
          targetRimOpacity = 0.48;
        } else if (isHovered) {
          // STATE 2: Hover — "Kertas Hidup & Sadar Sedang Di-hover"
          targetX = inst.pose.x;
          targetY = inst.pose.y + 0.06;
          targetZ = inst.pose.z + 0.62; // Lifts toward camera
          targetRotX = -tilt.y * 0.22 - 0.08;
          targetRotY = tilt.x * 0.26;
          targetRotZ = inst.pose.rotZRad * 0.35 + Math.sin(elapsedSec * 6.0) * 0.025;
          targetScale = 1.16;
          targetCurl = 0.28; // Corner curls up more dynamically
          targetWave = 0.045; // Active wind wave
          targetPinOffset = 0.14; // Pin lifts slightly as paper tries to break free
          targetRimOpacity = 0.55;
        } else {
          // STATE 1: Idle — Subtle micro-sway breathing on the board
          const breathe = Math.sin(elapsedSec * 1.6 + inst.pose.swayPhase);
          targetRotZ = inst.pose.rotZRad + breathe * 0.009;
          targetRotX = Math.cos(elapsedSec * 1.3 + inst.pose.swayPhase) * 0.012;
          targetCurl = 0.14 + breathe * 0.018;
          targetWave = 0.008;
          if (activeZoom !== null) {
            // Pull non-zoomed notes slightly back when another note is focused
            targetZ = inst.pose.z - 0.05;
          }
        }

        inst.currPos.x += (targetX - inst.currPos.x) * lerpFactor;
        inst.currPos.y += (targetY - inst.currPos.y) * lerpFactor;
        inst.currPos.z += (targetZ - inst.currPos.z) * lerpFactor;

        inst.currRot.x += (targetRotX - inst.currRot.x) * lerpFactor;
        inst.currRot.y += (targetRotY - inst.currRot.y) * lerpFactor;
        inst.currRot.z += (targetRotZ - inst.currRot.z) * lerpFactor;

        inst.currScale += (targetScale - inst.currScale) * lerpFactor;
        inst.currCurl += (targetCurl - inst.currCurl) * lerpFactor;
        inst.currWave += (targetWave - inst.currWave) * lerpFactor;
        inst.currPinOffset += (targetPinOffset - inst.currPinOffset) * lerpFactor;
        inst.currRimOpacity += (targetRimOpacity - inst.currRimOpacity) * lerpFactor;

        inst.group.position.copy(inst.currPos);
        inst.group.rotation.copy(inst.currRot);
        inst.group.scale.setScalar(inst.currScale);

        inst.pinGroup.position.y = noteH * 0.41 + inst.currPinOffset * 0.45;
        inst.pinGroup.position.z = 0.05 + inst.currPinOffset;
        inst.pinGroup.rotation.x = -inst.currPinOffset * 0.8;

        inst.rimMat.opacity = inst.currRimOpacity;
        inst.shadowMat.opacity = isZoomed ? 0.26 : isHovered ? 0.22 : 0.12;

        // Update vertex curl & wind wave for hovered/zoomed or periodically for idle breathing
        if (isHovered || isZoomed || !isSoftwareGl) {
          deformPaperGeometry(
            inst.paperGeo,
            inst.basePositions,
            inst.currCurl,
            inst.currWave,
            elapsedSec,
            inst.pose.swayPhase
          );
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, [poses, students]);

  const hoveredStudent =
    hoveredIndex !== null ? students[hoveredIndex] ?? null : null;
  const zoomedStudent =
    zoomedIndex !== null ? students[zoomedIndex] ?? null : null;
  const zoomedPose =
    zoomedIndex !== null ? poses[zoomedIndex] ?? null : null;

  const handleCycleZoomPaperColor = () => {
    if (!zoomedStudent) return;
    const currentHex =
      zoomColorOverride[zoomedStudent.id] ||
      zoomedPose?.paperColorHex ||
      DREAM_PAPER_PALETTE[0].hex;
    const currentIdx = DREAM_PAPER_PALETTE.findIndex(
      (p) => p.hex.toLowerCase() === currentHex.toLowerCase()
    );
    const nextPalette =
      DREAM_PAPER_PALETTE[(currentIdx + 1) % DREAM_PAPER_PALETTE.length];
    setZoomColorOverride((prev) => ({
      ...prev,
      [zoomedStudent.id]: nextPalette.hex,
    }));
    updatePaperColorRef.current(zoomedStudent.id, nextPalette.hex);
  };

  return (
    <section
      id="papan-cita-cita"
      aria-labelledby="heading-papan-cita-cita"
      className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-black/10 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.22em] text-[#6E78E8]">
              <Sparkles className="size-3.5" strokeWidth={1.5} />
              <span>03 · Papan Tulis Cita-Cita 3D Interaktif</span>
            </p>
            <h2
              id="heading-papan-cita-cita"
              className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Papan Cita-Cita &amp; Dream Notes 22 Siswa XII PPLG 1
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-[#5B6073] dark:text-[#A4AAC0]">
              Arahkan kursor ke salah satu dari 22 kertas catatan 3D di papan tulis untuk melihat kertas bergerak hidup, lalu klik kertas untuk melakukan <em>zoom-in</em> 3D dan membaca alasan serta rencana karier impian teman sekelasmu.
            </p>
          </div>

          {/* Interactive Legend / Status Indicator */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/75 px-3.5 py-1.5 text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-white">
              <Pin className="size-3.5 text-[#E0709A]" strokeWidth={1.5} />
              <span>22 Kertas 3D Tertempel</span>
            </span>
            {zoomedStudent ? (
              <button
                type="button"
                onClick={() => setZoomedIndex(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0B0D14] px-3.5 py-1.5 text-white transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]"
              >
                <X className="size-3.5" />
                <span>Keluar Mode Zoom (Esc)</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6E78E8]/30 bg-[#6E78E8]/10 px-3.5 py-1.5 text-[#6E78E8] dark:text-[#A8B0FF]">
                <MousePointerClick className="size-3.5" strokeWidth={1.5} />
                <span>Hover &amp; Klik Kertas untuk Zoom 3D</span>
              </span>
            )}
          </div>
        </div>

        {/* Main 3D Board Viewport Container */}
        <div className="relative mt-6 h-[560px] w-full overflow-hidden rounded-[26px] border border-white/60 bg-gradient-to-br from-[#DDE0F8]/80 via-[#E8ECF9]/75 to-[#D5EDE8]/80 shadow-inner sm:h-[640px] dark:border-white/15 dark:from-[#101426] dark:via-[#141A32] dark:to-[#102428]">
          {/* High-Craft Vector Isometric Classroom Board Underlay (Immediate zero-latency visual anchor) */}
          <svg
            viewBox="0 0 960 560"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover opacity-85 dark:opacity-55"
          >
            <defs>
              <radialGradient id="boardStudioGlow" cx="50%" cy="46%" r="54%">
                <stop offset="0%" stopColor="#6E78E8" stopOpacity="0.18" />
                <stop offset="60%" stopColor="#3FB8A5" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#EEF0F8" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="960" height="560" fill="url(#boardStudioGlow)" />
            {/* Board Silhouette Frame */}
            <rect
              x="76"
              y="38"
              width="808"
              height="454"
              rx="22"
              fill="#F6F7FC"
              fillOpacity="0.55"
              stroke="#D8D2C5"
              strokeWidth="8"
            />
            {/* Bottom Marker Tray Silhouette */}
            <rect
              x="310"
              y="490"
              width="340"
              height="14"
              rx="6"
              fill="#C8CEE8"
              fillOpacity="0.7"
            />
          </svg>

          {/* Interactive Three.js 3D Canvas */}
          <div
            ref={mountRef}
            className="relative z-[2] h-full w-full"
            aria-label="Kanvas 3D Papan Tulis Cita-Cita 22 Siswa XII PPLG 1"
          />

          {/* Subtle Backdrop Dim when in State 3 (Click & Zoom) */}
          {zoomedStudent && (
            <div
              onClick={() => setZoomedIndex(null)}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-r from-black/5 via-black/18 to-black/35 backdrop-blur-[1px] transition-opacity duration-300"
            />
          )}

          {/* STATE 2: FLOATING HOVER PROMPT ("✦ Klik buat baca impiannya") */}
          {hoveredStudent && !zoomedStudent && hoverScreenPos && (
            <div
              style={{
                left: `${hoverScreenPos.x}px`,
                top: `${hoverScreenPos.y}px`,
              }}
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full animate-bounce"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-4 py-2 text-xs font-semibold text-[#0B0D14] shadow-lg backdrop-blur-md dark:border-white/20 dark:bg-[#13182E]/95 dark:text-white">
                <Sparkles className="size-3.5 text-[#6E78E8]" strokeWidth={1.5} />
                <span>✦ Klik buat baca impiannya</span>
                <span className="font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                  ({hoveredStudent.name} · {hoveredStudent.dream_title})
                </span>
                <MousePointerClick className="size-3.5 text-[#3FB8A5]" strokeWidth={1.5} />
              </div>
            </div>
          )}

          {/* STATE 3: FLOATING DETAIL CONTAINER (Glassmorphism Card alongside the zoomed 3D Paper) */}
          {zoomedStudent && zoomedPose && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center p-4 sm:items-center sm:justify-end sm:p-5 lg:p-7">
              <article
                role="dialog"
                aria-modal="false"
                aria-label={`Detail cita-cita ${zoomedStudent.name}`}
                className="pointer-events-auto glass-panel max-h-[94%] w-full max-w-[490px] overflow-y-auto border border-white/85 bg-white/90 p-4 shadow-2xl backdrop-blur-xl sm:p-5 dark:border-white/20 dark:bg-[#101528]/92"
              >
                {/* 1. Identitas Siswa ("Oleh Siapa") */}
                <div className="flex items-start justify-between gap-3 border-b border-black/10 pb-3 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <Image
                      src={zoomedStudent.avatar_url}
                      alt={zoomedStudent.name}
                      width={46}
                      height={46}
                      referrerPolicy="no-referrer"
                      className="size-11 rounded-2xl border border-white/80 object-cover shadow-sm"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-[#6E78E8] dark:text-[#A8B0FF]">
                          XII PPLG 1 · No. {String(zoomedStudent.roll_no).padStart(2, '0')}
                        </span>
                        <span
                          style={{
                            backgroundColor:
                              zoomColorOverride[zoomedStudent.id] || zoomedPose.paperColorHex,
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-black/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0B0D14]"
                        >
                          Kertas {zoomedPose.paperColorName}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#0B0D14] dark:text-white">
                        {zoomedStudent.name}
                      </h3>
                      <p className="text-[11px] font-medium text-[#5B6073] dark:text-[#A4AAC0]">
                        {zoomedStudent.role} · Oleh {zoomedStudent.name}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setZoomedIndex(null)}
                    aria-label="Tutup fokus kertas cita-cita"
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-black/15 bg-white/80 px-3 font-mono text-xs font-semibold text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
                  >
                    <X className="size-3.5" />
                    <span>Tutup (Esc)</span>
                  </button>
                </div>

                {/* 2. Cita-Cita Utama ("Impian / Target") */}
                <div className="mt-3 rounded-2xl border border-black/10 bg-white/75 p-3.5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6E78E8] dark:text-[#A8B0FF]">
                      <Compass className="size-3.5" strokeWidth={1.5} />
                      <span>Impian / Target Karier Utama</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCycleZoomPaperColor}
                      title="Ganti warna pastel kertas 3D"
                      className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/80 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#5B6073] transition hover:text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-[#A4AAC0]"
                    >
                      <Shuffle className="size-3" />
                      <span>Warna Kertas</span>
                    </button>
                  </div>
                  <h4 className="mt-1 text-lg font-extrabold tracking-tight text-[#0B0D14] dark:text-white">
                    {zoomedStudent.dream_title}
                  </h4>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {zoomedStudent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#6E78E8]/12 px-2 py-0.5 font-mono text-[10px] font-medium text-[#4750C7] dark:bg-[#6E78E8]/25 dark:text-[#C5CAFF]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Alasan Memilih ("Kenapa Milih Itu?") */}
                <div className="mt-2.5 rounded-2xl border border-black/10 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#E0709A]">
                    <Heart className="size-3.5" strokeWidth={1.5} />
                    <span>Kenapa Milih Cita-Cita Itu?</span>
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-[#0B0D14] dark:text-white/90">
                    &ldquo;{zoomedStudent.dream_reason}&rdquo;
                  </p>
                </div>

                {/* 4. Deskripsi & Rencana ("Detail Dream Note") */}
                <div className="mt-2.5 rounded-2xl border border-black/10 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#3FB8A5]">
                    <FileText className="size-3.5" strokeWidth={1.5} />
                    <span>Detail Dream Note &amp; Rencana Langkah</span>
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                    {zoomedStudent.dream_description}
                  </p>
                </div>

                {/* 5. Kontrol Interaksi (Sebelumnya / Selanjutnya / Tutup) */}
                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-black/10 pt-3 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomedIndex((prev) =>
                        prev === null ? 0 : (prev - 1 + students.length) % students.length
                      )
                    }
                    className="inline-flex h-8.5 items-center gap-1.5 rounded-full border border-black/15 bg-white/85 px-3.5 text-xs font-semibold text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  <span className="font-mono text-[11px] text-[#5B6073] tabular-nums dark:text-[#A4AAC0]">
                    Kertas {String(zoomedStudent.roll_no).padStart(2, '0')} / {students.length}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setZoomedIndex((prev) =>
                        prev === null ? 0 : (prev + 1) % students.length
                      )
                    }
                    className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-[#0B0D14] px-3.5 text-xs font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </article>
            </div>
          )}
        </div>

        {/* Accessible 22-Note Quick Selector Strip (Syncs Hover & 3D Zoom) */}
        <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
              Pintasan 22 Kertas Cita-Cita Siswa (Hover untuk angkat kertas · Klik untuk Zoom 3D):
            </span>
            <span className="font-mono text-[11px] text-[#6E78E8] dark:text-[#A8B0FF]">
              {hoveredStudent
                ? `Sedang di-hover: ${hoveredStudent.name} — ${hoveredStudent.dream_title}`
                : zoomedStudent
                ? `Sedang dibuka: ${zoomedStudent.name} — ${zoomedStudent.dream_title}`
                : 'Arahkan kursor atau pilih nomor absen di bawah'}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {students.map((st, idx) => {
              const pose = poses[idx];
              const isZoomed = zoomedIndex === idx;
              const isHovered = hoveredIndex === idx;
              return (
                <button
                  key={st.id}
                  type="button"
                  onMouseEnter={() => {
                    if (zoomedIndex === null) {
                      setHoveredIndex(idx);
                      setHoverScreenPos({ x: 480, y: 180 });
                    }
                  }}
                  onMouseLeave={() => {
                    if (hoveredIndex === idx) {
                      setHoveredIndex(null);
                      setHoverScreenPos(null);
                    }
                  }}
                  onClick={() => {
                    setZoomedIndex(idx);
                    setHoveredIndex(null);
                    setHoverScreenPos(null);
                  }}
                  style={{
                    borderLeftColor: pose?.pinColorHex ?? '#6E78E8',
                  }}
                  className={`flex items-center justify-between gap-2 rounded-xl border border-black/10 border-l-4 px-3 py-2 text-left transition ${
                    isZoomed
                      ? 'bg-[#0B0D14] text-white shadow-md dark:bg-white dark:text-[#0B0D14]'
                      : isHovered
                      ? 'bg-white shadow-sm dark:bg-white/15'
                      : 'bg-white/65 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] opacity-75">
                      #{String(st.roll_no).padStart(2, '0')} · {st.name}
                    </p>
                    <p className="truncate text-xs font-bold">{st.dream_title}</p>
                  </div>
                  <Pin className="size-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
