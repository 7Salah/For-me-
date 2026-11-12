# 7Salah — HYBRID 3D Anime direction

Academic Quest remains an embedded section of 7Salah. Babylon.js, the procedural avatar fallback, movement, camera, collisions, and existing platform entry/return flow are retained.

## Implemented in this package

- GLB avatar meshes receive an anime-inspired dark contour outline.
- PBR avatar materials receive a softer, matte lighting response; Standard materials receive restrained highlights.
- Original avatar textures are preserved.
- Styling is applied only to avatar meshes. Campus/environment materials remain unchanged, maintaining the hybrid contrast.
- Outline width scales with the existing low/medium/high graphics setting.

## Important asset limitation

The four bundled GLB characters are Kenney Mini Characters 2.0 (CC0). They are suitable lightweight placeholder/student models, but they are **not** semi-realistic anime characters. The new styling pass adds a subtle anime-game treatment; it does not transform their geometry, faces, hair, or clothing into semi-realistic anime. Replacing them requires properly licensed, family-friendly anime-style GLB assets with suitable rigs and mobile budgets. The existing manifest safety gate must remain enabled (`safetyReviewed: true` only after review).

## Visual target

- Characters: semi-realistic anime 3D, natural proportions, modest campus clothing, expressive but age-appropriate faces.
- World: realistic campus architecture, landscaping, materials, and lighting.
- Performance: mobile-first quality tiers; preserve the procedural fallback when an asset fails or exceeds budget.
- Content: suitable for a general audience; no sexualized character designs or adult scenes.

## Validation status

This package has not been built in this environment because npm dependencies are not installed here. GitHub Actions should run `npm install`, `npm run typecheck`, `npm test`, and `npm run build` after upload. A successful workflow is required before calling the change verified.
