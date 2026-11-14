"use client";

import * as React from "react";
import Image from "next/image";
import * as THREE from "three";
import { StudentRecord, DREAM_PAPER_PALETTE } from "@/lib/class-data";
import { computeDreamBoardLayout, DreamNoteBoardPose } from "@/lib/class-logic";
import { Sparkles, Pin, MousePointerClick, ChevronLeft, ChevronRight, X, Compass, Heart, FileText, Shuffle, Edit3, RotateCcw, Save, Clock, Layers } from "lucide-react";
import { toast } from "sonner";

interface DreamBoardSectionProps {
   students: StudentRecord[];
   isAdmin?: boolean;
   onUpdateStudentDream?: (
      studentId: string,
      payload: {
         dream_title: string;
         dream_reason: string;
         dream_description: string;
         dream_paper_color: string;
         capsule_message?: string | undefined;
      }
   ) => Promise<void>;
   onResetStudentDream?: (studentId: string) => Promise<void>;
}

const DEFAULT_PAPER_HEX = DREAM_PAPER_PALETTE[0]?.hex ?? "#FFF7D6";

// Pre-allocated math helpers outside the render loop (Zero GC in tick)
const _worldPos = new THREE.Vector3();

function createStudioEnvironmentScene(): {
   scene: THREE.Scene;
   dispose: () => void;
} {
   const envScene = new THREE.Scene();
   const boxGeo = new THREE.BoxGeometry(1, 1, 1);
   const mats: THREE.MeshBasicMaterial[] = [];

   const addPanel = (color: number, px: number, py: number, pz: number, sx: number, sy: number, sz: number) => {
      const mat = new THREE.MeshBasicMaterial({ color });
      mats.push(mat);
      const mesh = new THREE.Mesh(boxGeo, mat);
      mesh.position.set(px, py, pz);
      mesh.scale.set(sx, sy, sz);
      envScene.add(mesh);
   };

   addPanel(0xfffaf0, 6, 7, 7, 0.2, 6, 6);
   addPanel(0xdde0fa, -7, 4, 6, 0.2, 5, 5);
   addPanel(0xffffff, 0, 9, 0, 8, 0.2, 8);
   addPanel(0xcfebe2, 0, -6, 4, 6, 0.2, 4);

   return {
      scene: envScene,
      dispose: () => {
         boxGeo.dispose();
         mats.forEach(m => m.dispose());
      },
   };
}

function createRoundedBoxGeometry(width: number, height: number, depth: number, radius: number, smoothness = 4): THREE.BufferGeometry {
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

function createBoardSurfaceTexture(mode: "whiteboard" | "chalkboard", maxAnisotropy = 1): THREE.CanvasTexture {
   const canvas = document.createElement("canvas");
   canvas.width = 1024;
   canvas.height = 576;
   const ctx = canvas.getContext("2d");
   if (ctx) {
      if (mode === "whiteboard") {
         const grad = ctx.createLinearGradient(0, 0, 1024, 576);
         grad.addColorStop(0, "#F7F8FD");
         grad.addColorStop(0.5, "#EEF1FA");
         grad.addColorStop(1, "#E6EAF7");
         ctx.fillStyle = grad;
         ctx.fillRect(0, 0, 1024, 576);

         ctx.strokeStyle = "rgba(110, 120, 232, 0.065)";
         ctx.lineWidth = 1;
         for (let x = 48; x < 1024; x += 48) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 576);
            ctx.stroke();
         }
         for (let y = 48; y < 576; y += 48) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1024, y);
            ctx.stroke();
         }

         ctx.fillStyle = "rgba(71, 77, 102, 0.34)";
         ctx.font = '700 20px "JetBrains Mono", ui-monospace, monospace';
         ctx.textAlign = "center";
         ctx.fillText("✦ XII PPLG 1 — CLASS OF 2026 · PAPAN TULIS CITA-CITA 3D (22 DREAM NOTES) ✦", 512, 32);
         ctx.textAlign = "start";

         for (let i = 0; i < 2400; i++) {
            const nx = (i * 193) % 1024;
            const ny = (i * 109) % 576;
            ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.35)" : "rgba(91,96,115,0.035)";
            ctx.fillRect(nx, ny, 2, 2);
         }
      } else {
         const grad = ctx.createLinearGradient(0, 0, 1024, 576);
         grad.addColorStop(0, "#1B2D26");
         grad.addColorStop(0.5, "#172620");
         grad.addColorStop(1, "#121E19");
         ctx.fillStyle = grad;
         ctx.fillRect(0, 0, 1024, 576);

         ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
         ctx.lineWidth = 1;
         for (let x = 48; x < 1024; x += 48) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 576);
            ctx.stroke();
         }
         for (let y = 48; y < 576; y += 48) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1024, y);
            ctx.stroke();
         }

         ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
         ctx.font = '700 20px "JetBrains Mono", ui-monospace, monospace';
         ctx.textAlign = "center";
         ctx.fillText("✦ XII PPLG 1 — CLASS OF 2026 · PAPAN TULIS CITA-CITA 3D (22 DREAM NOTES) ✦", 512, 32);
         ctx.textAlign = "start";

         for (let i = 0; i < 2200; i++) {
            const nx = (i * 193) % 1024;
            const ny = (i * 109) % 576;
            ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
            ctx.fillRect(nx, ny, 2, 2);
         }
      }
   }
   const tex = new THREE.CanvasTexture(canvas);
   tex.colorSpace = THREE.SRGBColorSpace;
   tex.anisotropy = maxAnisotropy;
   tex.needsUpdate = true;
   return tex;
}

function createDreamNoteTextTexture(rollNo: number, name: string, dreamTitle: string, role: string, pinHex: string, maxAnisotropy = 1): THREE.CanvasTexture {
   const canvas = document.createElement("canvas");
   canvas.width = 512;
   canvas.height = 384;
   const ctx = canvas.getContext("2d");
   if (ctx) {
      ctx.clearRect(0, 0, 512, 384);

      ctx.strokeStyle = "rgba(11, 13, 20, 0.06)";
      ctx.lineWidth = 2;
      for (let y = 118; y < 340; y += 44) {
         ctx.beginPath();
         ctx.moveTo(34, y);
         ctx.lineTo(478, y);
         ctx.stroke();
      }

      const padded = String(rollNo).padStart(2, "0");
      ctx.fillStyle = "#474D66";
      ctx.font = '700 26px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(`#${padded} · ${name}`, 36, 76);

      ctx.fillStyle = pinHex;
      ctx.fillRect(36, 92, 96, 6);

      ctx.fillStyle = "#0B0D14";
      ctx.font = '800 36px "Plus Jakarta Sans", system-ui, sans-serif';
      const words = (dreamTitle || "").split(" ");
      const lines: string[] = [];
      let currentLine = "";
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

      ctx.fillStyle = "rgba(11, 13, 20, 0.56)";
      ctx.font = '600 21px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText((role || "").toUpperCase(), 36, 344);

      ctx.fillStyle = "rgba(11, 13, 20, 0.08)";
      ctx.beginPath();
      ctx.moveTo(452, 384);
      ctx.lineTo(512, 324);
      ctx.lineTo(512, 384);
      ctx.closePath();
      ctx.fill();
   }
   const tex = new THREE.CanvasTexture(canvas);
   tex.colorSpace = THREE.SRGBColorSpace;
   tex.anisotropy = maxAnisotropy;
   tex.needsUpdate = true;
   return tex;
}

/**
 * Applies realistic 3D paper curl/bend + dynamic wind wave to a 16x16 segmented PlaneGeometry.
 */
function deformPaperGeometry(geo: THREE.PlaneGeometry, basePositions: Float32Array, curlAmount: number, waveAmount: number, timeSec: number, seedPhase: number) {
   const pos = geo.attributes.position as THREE.BufferAttribute;
   const arr = pos.array as Float32Array;
   const count = pos.count;

   for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = basePositions[ix] ?? 0;
      const y = basePositions[ix + 1] ?? 0;

      const nx = x / 0.86;
      const ny = y / 0.62;

      const distFromTop = Math.max(0, (1 - ny) * 0.5);
      const cornerFactor = Math.pow(distFromTop, 1.85) * (0.65 + 0.35 * Math.abs(nx));
      const asymmetry = nx * 0.025 * distFromTop;

      const windWave = Math.sin(timeSec * 5.2 + seedPhase + nx * 2.1 - ny * 1.8) * waveAmount * distFromTop;

      arr[ix] = x;
      arr[ix + 1] = y;
      arr[ix + 2] = cornerFactor * curlAmount + asymmetry + windWave;
   }

   pos.needsUpdate = true;
   geo.computeVertexNormals();
}

export function DreamBoardSection({ students, isAdmin = false, onUpdateStudentDream, onResetStudentDream }: DreamBoardSectionProps) {
   const mountRef = React.useRef<HTMLDivElement | null>(null);
   const poses = React.useMemo(() => computeDreamBoardLayout(students), [students]);

   // Ensure 1:1 index alignment between poses and students
   const orderedStudents = React.useMemo(() => poses.map((pose, idx) => students.find(s => s.id === pose.studentId) ?? students[idx]).filter((s): s is StudentRecord => Boolean(s)), [poses, students]);

   const [boardFinish, setBoardFinish] = React.useState<"whiteboard" | "chalkboard">("whiteboard");
   const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
   const [zoomedIndex, setZoomedIndex] = React.useState<number | null>(null);
   const [hoverScreenPos, setHoverScreenPos] = React.useState<{ x: number; y: number } | null>(null);
   const [zoomColorOverride, setZoomColorOverride] = React.useState<Record<string, string>>({});
   const [isEditingModal, setIsEditingModal] = React.useState(false);
   const [isSavingEdit, setIsSavingEdit] = React.useState(false);
   const [editTitle, setEditTitle] = React.useState("");
   const [editReason, setEditReason] = React.useState("");
   const [editDesc, setEditDesc] = React.useState("");
   const [editCapsule, setEditCapsule] = React.useState("");
   const [editColor, setEditColor] = React.useState<string>(DEFAULT_PAPER_HEX);

   // Refs synced for the Three.js loop
   const hoveredIndexRef = React.useRef<number | null>(null);
   const zoomedIndexRef = React.useRef<number | null>(null);
   const boardFinishRef = React.useRef<"whiteboard" | "chalkboard">(boardFinish);
   const pointerTiltRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
   const updatePaperColorRef = React.useRef<(studentId: string, hex: string) => void>(() => {});
   const updateBoardFinishRef = React.useRef<(mode: "whiteboard" | "chalkboard") => void>(() => {});
   const syncNotesContentRef = React.useRef<(nextStudents: StudentRecord[], nextPoses: DreamNoteBoardPose[], overrides: Record<string, string>) => void>(() => {});

   React.useEffect(() => {
      hoveredIndexRef.current = hoveredIndex;
   }, [hoveredIndex]);

   React.useEffect(() => {
      zoomedIndexRef.current = zoomedIndex;
   }, [zoomedIndex]);

   React.useEffect(() => {
      boardFinishRef.current = boardFinish;
   }, [boardFinish]);

   // Sync 3D note textures & colors in-place when student data or color overrides change (without destroying WebGL context)
   React.useEffect(() => {
      syncNotesContentRef.current(orderedStudents, poses, zoomColorOverride);
   }, [orderedStudents, poses, zoomColorOverride]);

   // Expose testable state hook on window for automated Playwright verification
   React.useEffect(() => {
      if (typeof window === "undefined") return;
      const win = window as unknown as Record<string, unknown>;
      win.__dream_board_state = () => ({
         activeState: zoomedIndexRef.current !== null ? "zoom" : hoveredIndexRef.current !== null ? "hover" : "idle",
         hoveredIndex: hoveredIndexRef.current,
         zoomedIndex: zoomedIndexRef.current,
         noteCount: poses.length,
         boardFinish,
         isStaticBoardLocked: true,
      });
      return () => {
         delete win.__dream_board_state;
      };
   }, [poses.length, boardFinish]);

   // Keyboard navigation when a 3D paper is zoomed (Escape, ArrowLeft, ArrowRight)
   React.useEffect(() => {
      if (zoomedIndex === null || orderedStudents.length === 0) return;
      const onKeyDown = (e: KeyboardEvent) => {
         // Avoid hijacking Left/Right arrows while typing inside input/textarea in Admin Edit mode
         const target = e.target as HTMLElement | null;
         const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");

         if (e.key === "Escape") {
            setIsEditingModal(false);
            setZoomedIndex(null);
         } else if (!isTyping && e.key === "ArrowRight") {
            setIsEditingModal(false);
            setZoomedIndex(prev => (prev === null ? 0 : (prev + 1) % orderedStudents.length));
         } else if (!isTyping && e.key === "ArrowLeft") {
            setIsEditingModal(false);
            setZoomedIndex(prev => (prev === null ? 0 : (prev - 1 + orderedStudents.length) % orderedStudents.length));
         }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
   }, [zoomedIndex, orderedStudents.length]);

   // Build Three.js Scene only when note count changes (updates to student fields happen in-place via syncNotesContentRef)
   const noteCount = orderedStudents.length;
   React.useEffect(() => {
      const container = mountRef.current;
      if (!container || noteCount === 0) return;

      const isSoftwareGl = (() => {
         try {
            const probe = document.createElement("canvas").getContext("webgl2");
            if (!probe) return true;
            const ext = probe.getExtension("WEBGL_debug_renderer_info");
            const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
            const gpu = String(probe.getParameter(param));
            probe.getExtension("WEBGL_lose_context")?.loseContext();
            return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
         } catch {
            return true;
         }
      })();

      const segs = 16;
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
            powerPreference: "high-performance",
            preserveDrawingBuffer: true,
         });
      } catch {
         return;
      }

      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

      renderer.domElement.style.position = "relative";
      renderer.domElement.style.zIndex = "2";
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const disposableGeometries: THREE.BufferGeometry[] = [];
      const disposableMaterials: THREE.Material[] = [];
      const disposableTextures: THREE.Texture[] = [];

      // Studio Environment Reflection
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const studioEnv = createStudioEnvironmentScene();
      const envTarget = pmremGenerator.fromScene(studioEnv.scene, 0.04);
      scene.environment = envTarget.texture;
      disposableTextures.push(envTarget.texture);
      studioEnv.dispose();
      pmremGenerator.dispose();

      // Studio Lighting Rig
      const hemiLight = new THREE.HemisphereLight(0xf6f7ff, 0xd8dcf2, 1.15);
      hemiLight.position.set(0, 8, 0);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.65);
      keyLight.position.set(5.5, 7.5, 9.0);
      if (!isSoftwareGl) {
         keyLight.castShadow = true;
         keyLight.shadow.mapSize.width = 1024;
         keyLight.shadow.mapSize.height = 1024;
         keyLight.shadow.bias = -0.0005;
         keyLight.shadow.normalBias = 0.02;
      }
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xdde0fa, 0.85);
      fillLight.position.set(-7.0, 2.5, 6.0);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xcfebe2, 0.75);
      rimLight.position.set(0, -6.0, 5.0);
      scene.add(rimLight);

      // Root Classroom Board Group (100% STATIC)
      const boardGroup = new THREE.Group();
      scene.add(boardGroup);

      const outerFrameGeo = createRoundedBoxGeometry(13.6, 7.6, 0.34, 0.22, isSoftwareGl ? 2 : 4);
      disposableGeometries.push(outerFrameGeo);
      const outerFrameMat = new THREE.MeshStandardMaterial({
         color: 0xd8d0c5,
         roughness: 0.4,
         metalness: 0.12,
      });
      disposableMaterials.push(outerFrameMat);
      const outerFrameMesh = new THREE.Mesh(outerFrameGeo, outerFrameMat);
      outerFrameMesh.position.set(0, 0, -0.16);
      outerFrameMesh.receiveShadow = true;
      boardGroup.add(outerFrameMesh);

      const innerTrimGeo = createRoundedBoxGeometry(13.15, 7.15, 0.36, 0.16, 2);
      disposableGeometries.push(innerTrimGeo);
      const innerTrimMat = new THREE.MeshStandardMaterial({
         color: 0xc5cbe3,
         roughness: 0.4,
         metalness: 0.22,
      });
      disposableMaterials.push(innerTrimMat);
      const innerTrimMesh = new THREE.Mesh(innerTrimGeo, innerTrimMat);
      innerTrimMesh.position.set(0, 0, -0.14);
      boardGroup.add(innerTrimMesh);

      const whiteboardTex = createBoardSurfaceTexture("whiteboard", maxAnisotropy);
      const chalkboardTex = createBoardSurfaceTexture("chalkboard", maxAnisotropy);
      disposableTextures.push(whiteboardTex, chalkboardTex);

      const surfaceGeo = new THREE.PlaneGeometry(12.85, 6.85);
      disposableGeometries.push(surfaceGeo);
      const surfaceMat = new THREE.MeshStandardMaterial({
         map: whiteboardTex,
         roughness: 0.52,
         metalness: 0.04,
      });
      disposableMaterials.push(surfaceMat);
      const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
      surfaceMesh.position.set(0, 0, 0.05);
      surfaceMesh.receiveShadow = true;
      boardGroup.add(surfaceMesh);

      updateBoardFinishRef.current = (mode: "whiteboard" | "chalkboard") => {
         surfaceMat.map = mode === "whiteboard" ? whiteboardTex : chalkboardTex;
         outerFrameMat.color.setHex(mode === "whiteboard" ? 0xd8d0c5 : 0x7a5230);
         innerTrimMat.color.setHex(mode === "whiteboard" ? 0xc5cbe3 : 0x5c3c22);
         surfaceMat.needsUpdate = true;
      };
      // Apply current board finish immediately
      updateBoardFinishRef.current(boardFinishRef.current);

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
         textMat: THREE.MeshBasicMaterial;
         textSignature: string;
         rimMesh: THREE.Mesh;
         rimMat: THREE.MeshBasicMaterial;
         pinGroup: THREE.Group;
         shadowMat: THREE.MeshBasicMaterial;
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

      const shadowPlaneGeo = new THREE.PlaneGeometry(noteW * 1.04, noteH * 1.04);
      disposableGeometries.push(shadowPlaneGeo);

      poses.forEach((pose, idx) => {
         const student = orderedStudents[idx];
         if (!student) return;

         const group = new THREE.Group();
         group.position.set(pose.x, pose.y, pose.z);
         group.rotation.set(0, 0, pose.rotZRad);
         boardGroup.add(group);

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

         const paperGeo = new THREE.PlaneGeometry(noteW, noteH, segs, segs);
         disposableGeometries.push(paperGeo);
         const basePositions = new Float32Array((paperGeo.attributes.position as THREE.BufferAttribute).array);
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

         const textSignature = `${student.roll_no}|${student.name}|${student.dream_title}|${student.role}|${pose.pinColorHex}`;
         const textTex = createDreamNoteTextTexture(student.roll_no, student.name, student.dream_title, student.role, pose.pinColorHex, maxAnisotropy);
         disposableTextures.push(textTex);

         const textMat = new THREE.MeshBasicMaterial({
            map: textTex,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
         });
         disposableMaterials.push(textMat);

         const textMesh = new THREE.Mesh(paperGeo, textMat);
         textMesh.position.set(0, 0, 0.012);
         group.add(textMesh);

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
            textMat,
            textSignature,
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

      updatePaperColorRef.current = (studentId: string, hex: string) => {
         const target = noteInstances.find(n => n.student.id === studentId);
         if (target) {
            target.paperMat.color.set(hex);
         }
      };

      syncNotesContentRef.current = (nextStudents, nextPoses, overrides) => {
         noteInstances.forEach((inst, idx) => {
            const st = nextStudents[idx];
            const pose = nextPoses[idx];
            if (!st || !pose) return;
            inst.student = st;
            inst.pose = pose;

            const activeHex = overrides[st.id] || pose.paperColorHex;
            inst.paperMat.color.set(activeHex);

            const nextSig = `${st.roll_no}|${st.name}|${st.dream_title}|${st.role}|${pose.pinColorHex}`;
            if (inst.textSignature !== nextSig) {
               inst.textSignature = nextSig;
               const oldTex = inst.textMat.map;
               const nextTex = createDreamNoteTextTexture(st.roll_no, st.name, st.dream_title, st.role, pose.pinColorHex, maxAnisotropy);
               disposableTextures.push(nextTex);
               inst.textMat.map = nextTex;
               inst.textMat.needsUpdate = true;
               if (oldTex) oldTex.dispose();
            }
         });
      };

      // High-Performance Raycasting for Hover & Click on the 22 3D Notes
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let lastRaycastMs = 0;

      const updatePointerAndRaycast = (clientX: number, clientY: number) => {
         const now = performance.now();
         if (now - lastRaycastMs < 24) return;
         lastRaycastMs = now;

         const rect = renderer.domElement.getBoundingClientRect();
         pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
         pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

         pointerTiltRef.current = { x: pointer.x, y: pointer.y };

         if (zoomedIndexRef.current !== null) {
            return;
         }

         raycaster.setFromCamera(pointer, camera);
         const hits = raycaster.intersectObjects(pickablePaperMeshes, false);
         const firstHit = hits[0];
         if (firstHit) {
            const hitIdx = firstHit.object.userData?.noteIndex;
            if (typeof hitIdx === "number") {
               renderer.domElement.style.cursor = "pointer";
               if (hoveredIndexRef.current !== hitIdx) {
                  hoveredIndexRef.current = hitIdx;
                  setHoveredIndex(hitIdx);
               }

               const inst = noteInstances[hitIdx];
               if (inst) {
                  inst.group.getWorldPosition(_worldPos);
                  _worldPos.y += 0.72;
                  _worldPos.z += 0.25;
                  _worldPos.project(camera);
                  const sx = ((_worldPos.x + 1) / 2) * rect.width;
                  const sy = ((-_worldPos.y + 1) / 2) * rect.height;
                  setHoverScreenPos({
                     x: Math.max(110, Math.min(rect.width - 110, sx)),
                     y: Math.max(36, Math.min(rect.height - 36, sy)),
                  });
               }
               return;
            }
         }

         renderer.domElement.style.cursor = "default";
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
         const firstHit = hits[0];
         if (firstHit) {
            const hitIdx = firstHit.object.userData?.noteIndex;
            if (typeof hitIdx === "number") {
               if (zoomedIndexRef.current === hitIdx) {
                  const inst = noteInstances[hitIdx];
                  if (inst) {
                     const randomPalette = DREAM_PAPER_PALETTE[Math.floor(Math.random() * DREAM_PAPER_PALETTE.length)];
                     if (randomPalette) {
                        inst.paperMat.color.set(randomPalette.hex);
                        setZoomColorOverride(prev => ({
                           ...prev,
                           [inst.student.id]: randomPalette.hex,
                        }));
                     }
                  }
               } else {
                  setIsEditingModal(false);
                  zoomedIndexRef.current = hitIdx;
                  setZoomedIndex(hitIdx);
                  setHoveredIndex(null);
                  setHoverScreenPos(null);
               }
            }
         } else if (zoomedIndexRef.current !== null) {
            setIsEditingModal(false);
            zoomedIndexRef.current = null;
            setZoomedIndex(null);
         }
      };

      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerleave", onPointerLeave);
      renderer.domElement.addEventListener("pointerdown", onPointerDown);

      const onResize = () => {
         if (!container) return;
         const w = container.clientWidth || 960;
         const h = container.clientHeight || 580;
         camera.aspect = w / h;
         camera.position.z = w < 640 ? 15.2 : 12.65;
         camera.updateProjectionMatrix();
         renderer.setSize(w, h);
      };
      onResize();
      window.addEventListener("resize", onResize);

      if (!isSoftwareGl) {
         renderer.compile(scene, camera);
      }

      let frameId = 0;
      const afterDraw = (cb: () => void) => {
         const gl = renderer.getContext() as WebGL2RenderingContext;
         if (gl && typeof gl.fenceSync === "function") {
            const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            gl.flush();
            const poll = () => {
               const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
               if (state === gl.UNSIGNALED) {
                  frameId = window.setTimeout(poll, 5);
               } else {
                  if (sync) gl.deleteSync(sync);
                  frameId = window.setTimeout(cb, 80);
               }
            };
            frameId = window.setTimeout(poll, 5);
         } else {
            frameId = window.setTimeout(cb, 80);
         }
      };

      const startTimeMs = performance.now();
      let prevTimeSec = 0;

      const tick = () => {
         const elapsedSec = (performance.now() - startTimeMs) * 0.001;
         const dt = Math.min(elapsedSec - prevTimeSec, 0.1);
         prevTimeSec = elapsedSec;
         const lerpFactor = Math.min(1, dt * 8.5);

         const activeHover = hoveredIndexRef.current;
         const activeZoom = zoomedIndexRef.current;
         const tilt = pointerTiltRef.current;

         // STRICT STATIC BOARD LOCK
         boardGroup.rotation.set(0, 0, 0);
         boardGroup.position.set(0, 0, 0);

         for (let i = 0; i < noteInstances.length; i++) {
            const inst = noteInstances[i];
            if (!inst) continue;
            const isHovered = activeZoom === null && activeHover === i;
            const isZoomed = activeZoom === i;

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
               targetPinOffset = 0.36;
               targetRimOpacity = 0.48;
            } else if (isHovered) {
               targetX = inst.pose.x;
               targetY = inst.pose.y + 0.06;
               targetZ = inst.pose.z + 0.62;
               targetRotX = -tilt.y * 0.22 - 0.08;
               targetRotY = tilt.x * 0.26;
               targetRotZ = inst.pose.rotZRad * 0.35 + Math.sin(elapsedSec * 6.0) * 0.025;
               targetScale = 1.16;
               targetCurl = 0.28;
               targetWave = 0.045;
               targetPinOffset = 0.14;
               targetRimOpacity = 0.55;
            } else {
               const breathe = Math.sin(elapsedSec * 1.6 + inst.pose.swayPhase);
               targetRotZ = inst.pose.rotZRad + breathe * 0.009;
               targetRotX = Math.cos(elapsedSec * 1.3 + inst.pose.swayPhase) * 0.012;
               targetCurl = 0.14 + breathe * 0.018;
               targetWave = 0.008;
               if (activeZoom !== null) {
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

            if (isHovered || isZoomed || !isSoftwareGl) {
               deformPaperGeometry(inst.paperGeo, inst.basePositions, inst.currCurl, inst.currWave, elapsedSec, inst.pose.swayPhase);
            }
         }

         renderer.render(scene, camera);
         if (isSoftwareGl) {
            afterDraw(tick);
         } else {
            frameId = window.requestAnimationFrame(tick);
         }
      };

      tick();

      return () => {
         window.cancelAnimationFrame(frameId);
         window.clearTimeout(frameId);
         window.removeEventListener("resize", onResize);
         renderer.domElement.removeEventListener("pointermove", onPointerMove);
         renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
         renderer.domElement.removeEventListener("pointerdown", onPointerDown);
         disposableGeometries.forEach(g => g.dispose());
         disposableMaterials.forEach(m => m.dispose());
         disposableTextures.forEach(t => t.dispose());
         renderer.dispose();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [noteCount]);

   const hoveredStudent = hoveredIndex !== null ? (orderedStudents[hoveredIndex] ?? null) : null;
   const zoomedStudent = zoomedIndex !== null ? (orderedStudents[zoomedIndex] ?? null) : null;
   const zoomedPose = zoomedIndex !== null ? (poses[zoomedIndex] ?? null) : null;

   const handleCycleZoomPaperColor = () => {
      if (!zoomedStudent) return;
      const currentHex = zoomColorOverride[zoomedStudent.id] || zoomedPose?.paperColorHex || DEFAULT_PAPER_HEX;
      const currentIdx = DREAM_PAPER_PALETTE.findIndex(p => p.hex.toLowerCase() === currentHex.toLowerCase());
      const nextPalette = DREAM_PAPER_PALETTE[(currentIdx + 1) % DREAM_PAPER_PALETTE.length];
      const nextHex = nextPalette?.hex ?? DEFAULT_PAPER_HEX;

      setZoomColorOverride(prev => ({
         ...prev,
         [zoomedStudent.id]: nextHex,
      }));
      updatePaperColorRef.current(zoomedStudent.id, nextHex);
   };

   const handleToggleBoardFinish = () => {
      const nextMode = boardFinish === "whiteboard" ? "chalkboard" : "whiteboard";
      setBoardFinish(nextMode);
      updateBoardFinishRef.current(nextMode);
   };

   const activePaperHex = zoomedStudent && zoomedPose ? zoomColorOverride[zoomedStudent.id] || zoomedPose.paperColorHex : DEFAULT_PAPER_HEX;
   const activePaperName = DREAM_PAPER_PALETTE.find(p => p.hex.toLowerCase() === activePaperHex.toLowerCase())?.name ?? zoomedPose?.paperColorName ?? "Pastel";

   return (
      <section id="papan-cita-cita" aria-labelledby="heading-papan-cita-cita" className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
         <div className="glass-panel p-6 sm:p-8 lg:p-10">
            {/* Section Header */}
            <div className="flex flex-col gap-4 border-b border-black/10 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
               <div>
                  <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.22em] text-[#6E78E8]">
                     <Sparkles className="size-3.5" strokeWidth={1.5} />
                     <span>03 · Papan Tulis Cita-Cita 3D Interaktif</span>
                  </p>
                  <h2 id="heading-papan-cita-cita" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                     Papan Cita-Cita &amp; Dream Notes {orderedStudents.length} Siswa XII PPLG 1
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm text-[#5B6073] dark:text-[#A4AAC0]">
                     Arahkan kursor ke salah satu dari {orderedStudents.length} kertas catatan 3D di papan tulis untuk melihat kertas bergerak hidup, lalu klik kertas untuk melakukan <em>zoom-in</em> 3D dan membaca alasan serta rencana karier impian teman sekelasmu.
                  </p>
               </div>

               {/* Interactive Legend / Surface Switcher / Status Indicator */}
               <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <button type="button" onClick={handleToggleBoardFinish} className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/80 px-3.5 py-1.5 text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white">
                     <Layers className="size-3.5 text-[#6E78E8]" strokeWidth={1.5} />
                     <span>Permukaan: {boardFinish === "whiteboard" ? "Matte Whiteboard" : "Slate Chalkboard"}</span>
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/75 px-3.5 py-1.5 text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-white">
                     <Pin className="size-3.5 text-[#E0709A]" strokeWidth={1.5} />
                     <span>{orderedStudents.length} Kertas 3D Tertempel</span>
                  </span>
                  {zoomedStudent ? (
                     <button
                        type="button"
                        onClick={() => {
                           setIsEditingModal(false);
                           setZoomedIndex(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0B0D14] px-3.5 py-1.5 text-white transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]">
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
               {/* Vector Isometric Classroom Board Underlay */}
               <svg viewBox="0 0 960 560" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover opacity-85 dark:opacity-55">
                  <defs>
                     <radialGradient id="boardStudioGlow" cx="50%" cy="46%" r="54%">
                        <stop offset="0%" stopColor="#6E78E8" stopOpacity="0.18" />
                        <stop offset="60%" stopColor="#3FB8A5" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#EEF0F8" stopOpacity="0" />
                     </radialGradient>
                  </defs>
                  <rect width="960" height="560" fill="url(#boardStudioGlow)" />
                  <rect x="76" y="38" width="808" height="454" rx="22" fill="#F6F7FC" fillOpacity="0.55" stroke="#D8D2C5" strokeWidth="8" />
                  <rect x="310" y="490" width="340" height="14" rx="6" fill="#C8CEE8" fillOpacity="0.7" />
               </svg>

               {/* Interactive Three.js 3D Canvas */}
               <div ref={mountRef} className="relative z-[2] h-full w-full" aria-label="Kanvas 3D Papan Tulis Cita-Cita 22 Siswa XII PPLG 1" />

               {/* Subtle Backdrop Dim when in State 3 (Click & Zoom) */}
               {zoomedStudent && (
                  <div
                     onClick={() => {
                        setIsEditingModal(false);
                        setZoomedIndex(null);
                     }}
                     aria-hidden="true"
                     className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-r from-black/10 via-black/22 to-black/40 transition-opacity duration-300"
                  />
               )}

               {/* STATE 2: FLOATING HOVER PROMPT ("✦ Klik buat baca impiannya") */}
               {hoveredStudent && !zoomedStudent && hoverScreenPos && (
                  <div
                     data-testid="floating-hover-prompt"
                     style={{
                        left: `${hoverScreenPos.x}px`,
                        top: `${hoverScreenPos.y}px`,
                     }}
                     className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full transition-transform duration-150">
                     <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/96 px-4 py-2 text-xs font-semibold text-[#0B0D14] shadow-lg dark:border-white/20 dark:bg-[#13182E]/96 dark:text-white">
                        <Sparkles className="size-3.5 text-[#6E78E8]" strokeWidth={1.5} />
                        <span>✦ Klik buat baca impiannya</span>
                        <span className="font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                           ({hoveredStudent.name} · {hoveredStudent.dream_title})
                        </span>
                        <MousePointerClick className="size-3.5 text-[#3FB8A5]" strokeWidth={1.5} />
                     </div>
                  </div>
               )}

               {/* STATE 3: FLOATING DETAIL CONTAINER (Glass Card alongside the zoomed 3D Paper) */}
               {zoomedStudent && zoomedPose && (
                  <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center p-4 sm:items-center sm:justify-end sm:p-5 lg:p-7">
                     <article role="dialog" aria-modal="false" data-testid="dream-note-detail-modal" aria-label={`Detail cita-cita ${zoomedStudent.name}`} className="pointer-events-auto max-h-[94%] w-full max-w-[490px] overflow-y-auto rounded-[24px] border border-white/85 bg-white/96 p-4 shadow-2xl sm:p-5 dark:border-white/20 dark:bg-[#101528]/96">
                        {/* 1. Identitas Siswa ("Oleh Siapa" + Nomor Absen & Role) */}
                        <div className="flex items-start justify-between gap-3 border-b border-black/10 pb-3 dark:border-white/10">
                           <div className="flex items-center gap-3">
                              <Image src={zoomedStudent.avatar_url} alt={zoomedStudent.name} width={46} height={46} referrerPolicy="no-referrer" className="size-11 rounded-2xl border border-white/80 object-cover shadow-sm" />
                              <div>
                                 <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-mono text-[11px] font-semibold text-[#6E78E8] dark:text-[#A8B0FF]">
                                       XII PPLG 1 · No. {String(zoomedStudent.roll_no).padStart(2, "0")} · NIS {zoomedStudent.nis || `202310${String(zoomedStudent.roll_no).padStart(2, "0")}`}
                                    </span>
                                    <span
                                       style={{
                                          backgroundColor: activePaperHex,
                                       }}
                                       className="inline-flex items-center gap-1 rounded-full border border-black/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0B0D14]">
                                       Kertas {activePaperName}
                                    </span>
                                 </div>
                                 <h3 className="text-base font-extrabold text-[#0B0D14] dark:text-white">{zoomedStudent.name}</h3>
                                 <p className="text-[11px] font-medium text-[#5B6073] dark:text-[#A4AAC0]">Oleh Siapa: {zoomedStudent.role} · XII PPLG 1 (Class of 2026)</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-1.5">
                              {isAdmin && (
                                 <button
                                    type="button"
                                    onClick={() => {
                                       if (!isEditingModal) {
                                          setEditTitle(zoomedStudent.dream_title);
                                          setEditReason(zoomedStudent.dream_reason);
                                          setEditDesc(zoomedStudent.dream_description);
                                          setEditCapsule(zoomedStudent.capsule_message || `Kapsul Waktu 2026 — Sampai bertemu lagi sebagai ${zoomedStudent.dream_title}!`);
                                          setEditColor(zoomColorOverride[zoomedStudent.id] || zoomedStudent.dream_paper_color || zoomedPose.paperColorHex);
                                       }
                                       setIsEditingModal(v => !v);
                                    }}
                                    className="inline-flex h-8 items-center gap-1 rounded-full bg-[#6E78E8] px-3 font-mono text-xs font-semibold text-white transition hover:opacity-90">
                                    <Edit3 className="size-3.5" />
                                    <span>{isEditingModal ? "Batal" : "Edit Admin"}</span>
                                 </button>
                              )}
                              <button
                                 type="button"
                                 onClick={() => {
                                    setIsEditingModal(false);
                                    setZoomedIndex(null);
                                 }}
                                 aria-label="Tutup fokus kertas cita-cita"
                                 className="inline-flex h-8 items-center gap-1 rounded-full border border-black/15 bg-white/80 px-3 font-mono text-xs font-semibold text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white">
                                 <X className="size-3.5" />
                                 <span>Tutup (Esc)</span>
                              </button>
                           </div>
                        </div>

                        {isAdmin && isEditingModal ? (
                           <form
                              onSubmit={async e => {
                                 e.preventDefault();
                                 if (!onUpdateStudentDream || isSavingEdit) return;
                                 try {
                                    setIsSavingEdit(true);
                                    await onUpdateStudentDream(zoomedStudent.id, {
                                       dream_title: editTitle,
                                       dream_reason: editReason,
                                       dream_description: editDesc,
                                       dream_paper_color: editColor,
                                       capsule_message: editCapsule,
                                    });
                                    setZoomColorOverride(prev => ({
                                       ...prev,
                                       [zoomedStudent.id]: editColor,
                                    }));
                                    updatePaperColorRef.current(zoomedStudent.id, editColor);
                                    setIsEditingModal(false);
                                    toast.success(`Catatan mimpi ${zoomedStudent.name} berhasil disimpan!`);
                                 } catch {
                                    toast.error("Gagal menyimpan perubahan catatan mimpi.");
                                 } finally {
                                    setIsSavingEdit(false);
                                 }
                              }}
                              className="mt-3 space-y-2.5 rounded-2xl border border-[#6E78E8]/35 bg-white/85 p-3.5 dark:bg-[#151A30]/90">
                              <div className="flex items-center justify-between">
                                 <span className="font-mono text-[10px] font-bold uppercase text-[#6E78E8]">Mode Admin · Edit Catatan Mimpi &amp; Kapsul Waktu</span>
                                 {onResetStudentDream && (
                                    <button
                                       type="button"
                                       onClick={async () => {
                                          try {
                                             await onResetStudentDream(zoomedStudent.id);
                                             setZoomColorOverride(prev => {
                                                const next = { ...prev };
                                                delete next[zoomedStudent.id];
                                                return next;
                                             });
                                             setIsEditingModal(false);
                                             toast.info(`Catatan mimpi ${zoomedStudent.name} direset ke default.`);
                                          } catch {
                                             toast.error("Gagal mereset catatan mimpi.");
                                          }
                                       }}
                                       className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#E11D48] hover:underline">
                                       <RotateCcw className="size-3" />
                                       <span>Reset / Hapus Editan</span>
                                    </button>
                                 )}
                              </div>

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                                 <div className="sm:col-span-8">
                                    <label className="block font-mono text-[10px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">Cita-Cita Pasca Lulus</label>
                                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="mt-1 h-9 w-full rounded-xl border border-black/15 bg-white px-2.5 text-xs font-semibold text-[#0B0D14] dark:border-white/20 dark:bg-white/10 dark:text-white" />
                                 </div>
                                 <div className="sm:col-span-4">
                                    <label className="block font-mono text-[10px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">Warna Kertas</label>
                                    <select value={editColor} onChange={e => setEditColor(e.target.value)} className="mt-1 h-9 w-full rounded-xl border border-black/15 bg-white px-2 text-xs font-semibold text-[#0B0D14] dark:border-white/20 dark:bg-[#101528] dark:text-white">
                                       {DREAM_PAPER_PALETTE.map(p => (
                                          <option key={p.hex} value={p.hex}>
                                             {p.name}
                                          </option>
                                       ))}
                                    </select>
                                 </div>
                              </div>

                              <div>
                                 <label className="block font-mono text-[10px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">Alasan Memilih (&ldquo;Kenapa Milih Itu?&rdquo;)</label>
                                 <textarea rows={2} value={editReason} onChange={e => setEditReason(e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white p-2 text-xs text-[#0B0D14] dark:border-white/20 dark:bg-white/10 dark:text-white" />
                              </div>

                              <div>
                                 <label className="block font-mono text-[10px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">Detail Dream Note &amp; Rencana</label>
                                 <textarea rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white p-2 text-xs text-[#0B0D14] dark:border-white/20 dark:bg-white/10 dark:text-white" />
                              </div>

                              <div>
                                 <label className="block font-mono text-[10px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">Pesan Kapsul Waktu 2026</label>
                                 <textarea rows={2} value={editCapsule} onChange={e => setEditCapsule(e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white p-2 text-xs text-[#0B0D14] dark:border-white/20 dark:bg-white/10 dark:text-white" />
                              </div>

                              <button type="submit" disabled={isSavingEdit} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-[#0B0D14]">
                                 <Save className="size-3.5" />
                                 <span>{isSavingEdit ? "Menyimpan..." : "Simpan Perubahan Real-Time"}</span>
                              </button>
                           </form>
                        ) : (
                           <>
                              {/* 2. Cita-Cita Utama ("Impian / Target") */}
                              <div className="mt-3 rounded-2xl border border-black/10 bg-white/80 p-3.5 dark:border-white/10 dark:bg-white/5">
                                 <div className="flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6E78E8] dark:text-[#A8B0FF]">
                                       <Compass className="size-3.5" strokeWidth={1.5} />
                                       <span>Impian / Target Utama</span>
                                    </span>
                                    <button type="button" onClick={handleCycleZoomPaperColor} title="Ganti warna pastel kertas 3D" className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/80 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#5B6073] transition hover:text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-[#A4AAC0]">
                                       <Shuffle className="size-3" />
                                       <span>Warna Kertas</span>
                                    </button>
                                 </div>
                                 <h4 className="mt-1 text-lg font-extrabold tracking-tight text-[#0B0D14] dark:text-white">{zoomedStudent.dream_title}</h4>
                                 <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {zoomedStudent.tags.map(tag => (
                                       <span key={tag} className="rounded-full bg-[#6E78E8]/12 px-2 py-0.5 font-mono text-[10px] font-medium text-[#4750C7] dark:bg-[#6E78E8]/25 dark:text-[#C5CAFF]">
                                          #{tag}
                                       </span>
                                    ))}
                                 </div>
                              </div>

                              {/* 3. Alasan Memilih ("Kenapa Milih Itu?") */}
                              <div className="mt-2.5 rounded-2xl border border-black/10 bg-white/75 p-3.5 dark:border-white/10 dark:bg-white/5">
                                 <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#E0709A]">
                                    <Heart className="size-3.5" strokeWidth={1.5} />
                                    <span>Kenapa Milih Itu?</span>
                                 </span>
                                 <p className="mt-1 text-xs leading-relaxed text-[#0B0D14] dark:text-white/90">&ldquo;{zoomedStudent.dream_reason}&rdquo;</p>
                              </div>

                              {/* 4. Deskripsi & Rencana ("Detail Dream Note") */}
                              <div className="mt-2.5 rounded-2xl border border-black/10 bg-white/75 p-3.5 dark:border-white/10 dark:bg-white/5">
                                 <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#3FB8A5]">
                                    <FileText className="size-3.5" strokeWidth={1.5} />
                                    <span>Detail Dream Note &amp; Rencana</span>
                                 </span>
                                 <p className="mt-1 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">{zoomedStudent.dream_description}</p>
                                 {zoomedStudent.capsule_message && (
                                    <p className="mt-2 flex items-start gap-1.5 border-t border-black/10 pt-2 font-mono text-[11px] text-[#0B0D14] dark:border-white/10 dark:text-white/90">
                                       <Clock className="mt-0.5 size-3.5 shrink-0 text-[#F0A04B]" />
                                       <span>{zoomedStudent.capsule_message}</span>
                                    </p>
                                 )}
                              </div>
                           </>
                        )}

                        {/* 5. Kontrol Interaksi (Sebelumnya / Selanjutnya / Tutup) */}
                        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-black/10 pt-3 dark:border-white/10">
                           <button
                              type="button"
                              onClick={() => {
                                 setIsEditingModal(false);
                                 setZoomedIndex(prev => (prev === null ? 0 : (prev - 1 + orderedStudents.length) % orderedStudents.length));
                              }}
                              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/15 bg-white/85 px-3.5 text-xs font-semibold text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white">
                              <ChevronLeft className="size-3.5" />
                              <span>Sebelumnya</span>
                           </button>

                           <span className="font-mono text-[11px] text-[#5B6073] tabular-nums dark:text-[#A4AAC0]">
                              Kertas {String(zoomedStudent.roll_no).padStart(2, "0")} / {orderedStudents.length}
                           </span>

                           <button
                              type="button"
                              onClick={() => {
                                 setIsEditingModal(false);
                                 setZoomedIndex(prev => (prev === null ? 0 : (prev + 1) % orderedStudents.length));
                              }}
                              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0B0D14] px-3.5 text-xs font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]">
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
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">Pintasan {orderedStudents.length} Kertas Cita-Cita Siswa (Hover untuk angkat kertas · Klik untuk Zoom 3D):</span>
                  <span className="font-mono text-[11px] text-[#6E78E8] dark:text-[#A8B0FF]">{hoveredStudent ? `Sedang di-hover: ${hoveredStudent.name} — ${hoveredStudent.dream_title}` : zoomedStudent ? `Sedang dibuka: ${zoomedStudent.name} — ${zoomedStudent.dream_title}` : "Arahkan kursor atau pilih nomor absen di bawah"}</span>
               </div>

               <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {orderedStudents.map((st, idx) => {
                     const pose = poses[idx];
                     const isZoomed = zoomedIndex === idx;
                     const isHovered = hoveredIndex === idx;
                     return (
                        <button
                           key={st.id}
                           type="button"
                           data-testid={`dream-note-btn-${st.roll_no}`}
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
                              setIsEditingModal(false);
                              setZoomedIndex(idx);
                              setHoveredIndex(null);
                              setHoverScreenPos(null);
                           }}
                           style={{
                              borderLeftColor: pose?.pinColorHex ?? "#6E78E8",
                           }}
                           className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border border-black/10 border-l-4 px-2.5 py-2 text-left transition ${isZoomed ? "bg-[#0B0D14] text-white shadow-md dark:bg-white dark:text-[#0B0D14]" : isHovered ? "bg-white shadow-sm dark:bg-white/15" : "bg-white/65 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`}>
                           <div className="min-w-0">
                              <p className="truncate font-mono text-[10px] opacity-75">
                                 #{String(st.roll_no).padStart(2, "0")} · {st.name}
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

export const ClassDreamBoard3D = DreamBoardSection;
