"use client";

import * as React from "react";
import * as THREE from "three";
import { Gift, Cpu, GraduationCap, Disc3, Box, Sparkles } from "lucide-react";

export type CapsuleArtifactType = "giftbox" | "keycap" | "gradcap" | "vinyl" | "photocube";

interface ArtifactMiniCanvasProps {
   artifact: CapsuleArtifactType;
   accentHex?: string;
   label: string;
}

function buildArtifactGroup(
   type: CapsuleArtifactType,
   disposables: {
      geos: THREE.BufferGeometry[];
      mats: THREE.Material[];
   }
): THREE.Group {
   const group = new THREE.Group();
   const registerGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposables.geos.push(g);
      return g;
   };
   const registerMat = <T extends THREE.Material>(m: T): T => {
      disposables.mats.push(m);
      return m;
   };

   if (type === "giftbox") {
      const boxGeo = registerGeo(new THREE.BoxGeometry(1.35, 1.05, 1.35));
      const boxMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x6e78e8, roughness: 0.42, metalness: 0.15 }));
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.y = -0.1;

      const lidGeo = registerGeo(new THREE.BoxGeometry(1.44, 0.26, 1.44));
      const lidMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf9e3cb, roughness: 0.35, metalness: 0.1 }));
      const lidMesh = new THREE.Mesh(lidGeo, lidMat);
      lidMesh.position.y = 0.52;

      const ribbonVGeo = registerGeo(new THREE.BoxGeometry(0.22, 1.36, 1.46));
      const ribbonHGeo = registerGeo(new THREE.BoxGeometry(1.46, 1.36, 0.22));
      const ribbonMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xe0709a, roughness: 0.25, metalness: 0.3 }));
      const r1 = new THREE.Mesh(ribbonVGeo, ribbonMat);
      r1.position.y = 0.02;
      const r2 = new THREE.Mesh(ribbonHGeo, ribbonMat);
      r2.position.y = 0.02;

      group.add(boxMesh, lidMesh, r1, r2);
   } else if (type === "keycap") {
      const baseGeo = registerGeo(new THREE.CylinderGeometry(0.68, 0.85, 0.72, 4));
      baseGeo.rotateY(Math.PI / 4);
      const baseMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x3fb8a5, roughness: 0.32, metalness: 0.2 }));
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);

      const stemGeo = registerGeo(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 16));
      const stemMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf0a04b, roughness: 0.28, metalness: 0.45 }));
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 0.42;

      const plateGeo = registerGeo(new THREE.BoxGeometry(1.45, 0.14, 1.45));
      const plateMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1b223d, roughness: 0.5, metalness: 0.6 }));
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.y = -0.42;

      group.add(baseMesh, stemMesh, plateMesh);
   } else if (type === "gradcap") {
      const skullGeo = registerGeo(new THREE.CylinderGeometry(0.58, 0.5, 0.42, 20));
      const capMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x171c36, roughness: 0.48, metalness: 0.22 }));
      const skullMesh = new THREE.Mesh(skullGeo, capMat);
      skullMesh.position.y = -0.15;

      const boardGeo = registerGeo(new THREE.BoxGeometry(1.75, 0.09, 1.75));
      const boardMesh = new THREE.Mesh(boardGeo, capMat);
      boardMesh.position.y = 0.14;
      boardMesh.rotation.y = Math.PI / 4;

      const tasselGeo = registerGeo(new THREE.CylinderGeometry(0.05, 0.09, 0.75, 12));
      const tasselMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf0a04b, roughness: 0.25, metalness: 0.6 }));
      const tasselMesh = new THREE.Mesh(tasselGeo, tasselMat);
      tasselMesh.position.set(0.58, -0.12, 0.58);
      tasselMesh.rotation.z = -0.25;

      group.add(skullMesh, boardMesh, tasselMesh);
   } else if (type === "vinyl") {
      const discGeo = registerGeo(new THREE.CylinderGeometry(1.05, 1.05, 0.06, 32));
      discGeo.rotateX(Math.PI / 2);
      const discMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x141829, roughness: 0.22, metalness: 0.65 }));
      const discMesh = new THREE.Mesh(discGeo, discMat);

      const labelGeo = registerGeo(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24));
      labelGeo.rotateX(Math.PI / 2);
      const labelMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xe0709a, roughness: 0.35, metalness: 0.15 }));
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);

      const ringGeo = registerGeo(new THREE.TorusGeometry(0.72, 0.025, 12, 36));
      const ringMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x6e78e8, roughness: 0.3, metalness: 0.7 }));
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.z = 0.04;

      group.add(discMesh, labelMesh, ringMesh);
   } else {
      const cubeGeo = registerGeo(new THREE.BoxGeometry(1.22, 1.22, 1.22));
      const cubeMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xddd6f2, roughness: 0.32, metalness: 0.18 }));
      const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);

      const frameGeo = registerGeo(new THREE.BoxGeometry(1.28, 1.28, 1.28));
      const frameMat = registerMat(
         new THREE.MeshStandardMaterial({
            color: 0x6e78e8,
            roughness: 0.25,
            metalness: 0.55,
            wireframe: true,
         })
      );
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);

      group.add(cubeMesh, frameMesh);
   }

   return group;
}

function Artifact3DCanvas({ artifact, label }: ArtifactMiniCanvasProps) {
   const mountRef = React.useRef<HTMLDivElement | null>(null);
   const [boostSpin, setBoostSpin] = React.useState(false);
   const boostRef = React.useRef(false);

   React.useEffect(() => {
      boostRef.current = boostSpin;
   }, [boostSpin]);

   React.useEffect(() => {
      const container = mountRef.current;
      if (!container) return undefined;

      const width = Math.max(120, container.clientWidth || 180);
      const height = Math.max(120, container.clientHeight || 140);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 30);
      camera.position.set(0, 0.85, 3.8);
      camera.lookAt(0, 0, 0);

      let renderer: THREE.WebGLRenderer;
      try {
         renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      } catch {
         return undefined;
      }

      const gl = renderer.getContext();
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const rendererName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
      const isSoftwareGl = /SwiftShader|llvmpipe|Software|Google Inc\./i.test(rendererName);

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xdde6ff, 0xf9e3cb, 1.25);
      const dir = new THREE.DirectionalLight(0xfff5e8, 1.55);
      dir.position.set(3, 5, 4);
      const rim = new THREE.DirectionalLight(0x6e78e8, 0.85);
      rim.position.set(-3, 2, -3);
      scene.add(hemi, dir, rim);

      const disposables: { geos: THREE.BufferGeometry[]; mats: THREE.Material[] } = {
         geos: [],
         mats: [],
      };

      const shadowGeo = new THREE.CircleGeometry(0.95, 24);
      const shadowMat = new THREE.MeshBasicMaterial({
         color: 0x161b33,
         transparent: true,
         opacity: 0.16,
         depthWrite: false,
      });
      disposables.geos.push(shadowGeo);
      disposables.mats.push(shadowMat);

      const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = -0.92;
      scene.add(shadowDisc);

      const subject = buildArtifactGroup(artifact, disposables);
      scene.add(subject);

      let frameId = 0;
      let isTimer = false;
      let isVisible = true;
      let warmupFrames = 0;
      const startMs = performance.now();

      const afterDraw = (cb: () => void) => {
         if (!isSoftwareGl) {
            isTimer = false;
            frameId = window.requestAnimationFrame(cb);
            return;
         }
         isTimer = true;
         warmupFrames += 1;
         const delayMs = warmupFrames <= 3 ? 60 : 500;
         const gl2 = gl as WebGL2RenderingContext;
         if (typeof gl2.fenceSync === "function") {
            const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
            gl2.flush();
            const poll = () => {
               if (!sync) {
                  frameId = window.setTimeout(cb, delayMs);
                  return;
               }
               const status = gl2.clientWaitSync(sync, 0, 0);
               if (status === gl2.WAIT_FAILED) {
                  gl2.deleteSync(sync);
                  frameId = window.setTimeout(cb, delayMs);
                  return;
               }
               if (status === gl2.TIMEOUT_EXPIRED) {
                  frameId = window.setTimeout(poll, 16);
               } else {
                  gl2.deleteSync(sync);
                  frameId = window.setTimeout(cb, delayMs);
               }
            };
            frameId = window.setTimeout(poll, 10);
         } else {
            frameId = window.setTimeout(cb, delayMs);
         }
      };

      const animate = () => {
         if (!isVisible || document.hidden) {
            isTimer = true;
            frameId = window.setTimeout(animate, 400);
            return;
         }
         const t = (performance.now() - startMs) * 0.001;
         const speed = boostRef.current ? 3.2 : 0.85;
         subject.rotation.y = t * speed;
         subject.rotation.x = Math.sin(t * 1.4) * 0.18;
         subject.position.y = Math.sin(t * 2.0) * 0.06;
         renderer.render(scene, camera);
         afterDraw(animate);
      };

      const observer = new IntersectionObserver(
         entries => {
            isVisible = entries[0]?.isIntersecting ?? true;
         },
         { threshold: 0.05 }
      );
      observer.observe(container);

      renderer.render(scene, camera);
      afterDraw(animate);

      return () => {
         observer.disconnect();
         if (isTimer) {
            window.clearTimeout(frameId);
         } else {
            window.cancelAnimationFrame(frameId);
         }
         disposables.geos.forEach(g => g.dispose());
         disposables.mats.forEach(m => m.dispose());
         renderer.dispose();
      };
   }, [artifact]);

   return (
      <div
         ref={mountRef}
         onClick={() => setBoostSpin(b => !b)}
         role="button"
         tabIndex={0}
         aria-label={`Model 3D Interaktif ${label}`}
         onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
               e.preventDefault();
               setBoostSpin(b => !b);
            }
         }}
         className="h-28 w-full cursor-pointer select-none"
      />
   );
}

export function FarewellGiftBox3D() {
   return <Artifact3DCanvas artifact="giftbox" label="Kotak Kado Perpisahan 3D" />;
}

export function TechKeycap3D() {
   return <Artifact3DCanvas artifact="keycap" label="Keycap Mekanikal PPLG 3D" />;
}

export function GraduationCap3D() {
   return <Artifact3DCanvas artifact="gradcap" label="Topi Toga Kelulusan 2026 3D" />;
}

export function VinylDisc3D() {
   return <Artifact3DCanvas artifact="vinyl" label="Piringan Hitam Soundtrack Kelas 3D" />;
}

export function MemoryPhotoCube3D() {
   return <Artifact3DCanvas artifact="photocube" label="Kubus Memori Kenangan 3D" />;
}

export function GraduationCapsuleShowcase3D() {
   const items = [
      {
         id: "cap-grad",
         title: "Topi Kelulusan 2026",
         subtitle: "Class of 2026 · 22 Lulusan",
         tint: "tint-lilac",
         icon: GraduationCap,
         render: <GraduationCap3D />,
      },
      {
         id: "cap-gift",
         title: "Kapsul Kado Perpisahan",
         subtitle: "Pesan Masa Depan 2031",
         tint: "tint-peach",
         icon: Gift,
         render: <FarewellGiftBox3D />,
      },
      {
         id: "cap-keycap",
         title: "Keycap Rekayasa PPLG",
         subtitle: "Lab RPL 1 & Studio Gim",
         tint: "tint-sage",
         icon: Cpu,
         render: <TechKeycap3D />,
      },
      {
         id: "cap-vinyl",
         title: "Vinyl Playlist Lembur",
         subtitle: "Lo-Fi & Synthwave UKK",
         tint: "tint-orchid",
         icon: Disc3,
         render: <VinylDisc3D />,
      },
      {
         id: "cap-cube",
         title: "Kubus Memori 3 Tahun",
         subtitle: "Arsip 2023 – 2026",
         tint: "tint-sky",
         icon: Box,
         render: <MemoryPhotoCube3D />,
      },
   ];

   return (
      <div className="mt-6 border-t border-black/10 pt-6 dark:border-white/10">
         <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
               <Sparkles className="size-4 text-[#6E78E8]" />
               <h3 className="text-sm font-bold">Artefak 3D Kapsul Kelulusan XII PPLG 1 · Class of 2026</h3>
            </div>
            <span className="font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">Klik artefak 3D untuk memutar cepat (60fps WebGL)</span>
         </div>

         <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {items.map(item => {
               const Icon = item.icon;
               return (
                  <div key={item.id} className={`glass-card ${item.tint} flex flex-col justify-between p-3.5`}>
                     <div className="flex items-center justify-between font-mono text-[10px] text-[#5B6073] dark:text-[#A4AAC0]">
                        <span className="truncate font-semibold">{item.subtitle}</span>
                        <Icon className="size-3.5 shrink-0 text-[#6E78E8]" />
                     </div>
                     {item.render}
                     <p className="text-center text-xs font-bold">{item.title}</p>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
