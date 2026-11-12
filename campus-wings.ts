// Phase 22.2: Library (west) and Science Lab (east) wings around the courtyard.
// Built from primitives in a rotated local space (front = -Z). Fine details live in a separate node
// that is switched off on "low" quality and culled by distance (LOD) so the 30fps budget holds.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { facingYaw, wingFootprint } from "./campus-layout";
import type { Facing, Rect } from "./campus-layout";

export type WingSpec = {
  id: string; label: string; cx: number; cz: number; facing: Facing;
  width: number; depth: number; height: number;
  wall: StandardMaterial; accent: StandardMaterial;
};
export type WingKit = {
  scene: Scene; colliders: Rect[];
  navy: StandardMaterial; trim: StandardMaterial; glass: StandardMaterial; glassDark: StandardMaterial;
  cream: StandardMaterial; lightStone: StandardMaterial; goldLight: StandardMaterial;
};
const DETAIL_LOD_DISTANCE = 70;

export function buildWing(kit: WingKit, s: WingSpec) {
  const { scene } = kit;
  const root = new TransformNode(`${s.id}-root`, scene);
  root.position.set(s.cx, 0, s.cz);
  root.rotation.y = facingYaw(s.facing);
  const detail = new TransformNode(`${s.id}-detail`, scene);
  detail.parent = root;

  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number,
               mat: StandardMaterial, fine = false) => {
    const m = MeshBuilder.CreateBox(`${s.id}-${name}`, { width: w, height: h, depth: d }, scene);
    m.position.set(x, y, z); m.material = mat; m.parent = fine ? detail : root;
    m.isPickable = false;
    if (fine) m.addLODLevel(DETAIL_LOD_DISTANCE, null);          // hidden beyond this camera distance
    return m;
  };
  const w = s.width, d = s.depth, h = s.height;
  // Mass, plinth, roof edge and brass bands (always visible: these define the silhouette).
  box("plinth", w + 1, 0.4, d + 1, 0, 0.2, 0, kit.lightStone);
  box("body", w, h, d, 0, 0.4 + h / 2, 0, s.wall);
  box("roof", w + 1.4, 0.45, d + 1.4, 0, 0.4 + h + 0.22, 0, kit.navy);
  box("band-low", w + 0.1, 0.2, 0.2, 0, 0.4 + h * 0.42, -d / 2 - 0.02, kit.trim);

  // Entrance on the front (-Z): door, lintel, canopy, two columns, steps.
  box("door", 3.2, 2.9, 0.2, 0, 1.85, -d / 2 - 0.05, kit.glass);
  box("door-frame", 4.0, 3.4, 0.16, 0, 2.1, -d / 2 - 0.02, kit.navy);
  box("canopy", 6.2, 0.35, 2.0, 0, 3.95, -d / 2 - 1.0, s.accent);
  for (const x of [-2.5, 2.5]) {
    const col = MeshBuilder.CreateCylinder(`${s.id}-column`, { diameter: 0.5, height: 3.6, tessellation: 14 }, scene);
    col.position.set(x, 2.2, -d / 2 - 1.7); col.material = kit.cream; col.parent = root; col.isPickable = false;
  }
  box("step-1", 7.5, 0.2, 1.2, 0, 0.5, -d / 2 - 1.5, kit.cream);
  box("step-2", 9, 0.16, 1.1, 0, 0.58, -d / 2 - 2.5, kit.lightStone);

  // Fine detail (windows, mullions, side windows): dropped on "low" and beyond the LOD distance.
  const cols = Math.max(2, Math.floor((w - 6) / 2.4));
  for (let i = 0; i < cols; i += 1) {
    const x = (i - (cols - 1) / 2) * 2.4;
    if (Math.abs(x) < 3) continue;                              // leave the entrance clear
    box(`win-lo-${i}`, 1.5, 1.7, 0.16, x, 2.6, -d / 2 - 0.05, kit.glass, true);
    box(`win-hi-${i}`, 1.5, 1.9, 0.16, x, 0.4 + h * 0.72, -d / 2 - 0.05, kit.glassDark, true);
  }
  for (const side of [-1, 1]) for (let i = 0; i < 3; i += 1)
    box(`side-win-${side}-${i}`, 0.16, 1.7, 1.5, side * (w / 2 + 0.04), 2.7 + (i % 2) * 0.01, (i - 1) * 3, kit.glass, true);

  // Nameplate over the entrance.
  const tex = new DynamicTexture(`${s.id}-nameplate`, { width: 640, height: 128 }, scene, false);
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
  ctx.fillStyle = "#19344d"; ctx.fillRect(0, 0, 640, 128);
  ctx.strokeStyle = "#c5a873"; ctx.lineWidth = 6; ctx.strokeRect(7, 7, 626, 114);
  ctx.fillStyle = "#f5e8c9"; ctx.font = "700 50px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(s.label, 320, 64); tex.update();
  const signMat = new StandardMaterial(`${s.id}-nameplate-material`, scene);
  signMat.diffuseTexture = tex; signMat.emissiveColor = new Color3(0.22, 0.22, 0.16);
  const sign = MeshBuilder.CreatePlane(`${s.id}-sign`, { width: 6.6, height: 1.32 }, scene);
  sign.rotation.y = Math.PI;                                    // plane faces -Z in local space
  sign.position.set(0, 0.4 + h - 0.9, -d / 2 - 0.12); sign.material = signMat; sign.parent = root; sign.isPickable = false;

  kit.colliders.push(wingFootprint(s.cx, s.cz, w, d, 0.3));
  return { root, detail, setDetail: (on: boolean) => detail.setEnabled(on) };
}
export type Wing = ReturnType<typeof buildWing>;
