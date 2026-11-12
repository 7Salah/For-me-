import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { GraphicsQuality } from "./types";

/**
 * Applies a restrained anime-inspired finish to avatar meshes only.
 * Campus architecture and environment materials are intentionally untouched,
 * preserving the hybrid contrast: stylised characters + realistic campus.
 * Original textures are preserved; only lighting response and outlines change.
 */
export function applyHybridAnimeAvatarStyle(
  meshes: readonly AbstractMesh[],
  quality: GraphicsQuality
): void {
  const outlineWidth = quality === "high" ? 0.018 : quality === "medium" ? 0.012 : 0.007;

  for (const mesh of meshes) {
    if (mesh.getTotalVertices() === 0) continue;
    mesh.renderOutline = true;
    mesh.outlineColor = new Color3(0.075, 0.105, 0.16);
    mesh.outlineWidth = outlineWidth;

    const material = mesh.material;
    if (material instanceof PBRMaterial) {
      // Soft, matte response helps low-poly game avatars read more like cel-painted figures.
      material.metallic = 0;
      material.roughness = Math.max(material.roughness, 0.72);
      material.environmentIntensity = Math.min(material.environmentIntensity, 0.7);
    } else if (material instanceof StandardMaterial) {
      material.specularColor = new Color3(0.12, 0.14, 0.19);
      material.specularPower = 56;
    }
  }
}
