# GLB avatars (Phase 22.1 / 22.2-glb)

Put `.glb` files in this folder and list them in `manifest.json`. With no entries the procedural avatar is used.

```json
{ "models": [{
  "id": "student-a", "name": "Student A", "url": "student-a.glb",
  "animationsUrl": "shared-anims.glb", "height": 1.85, "yaw": 0, "safetyReviewed": true
}] }
```

**Required**
- `safetyReviewed: true` only after the checklist in `docs/V22-CONTENT-SAFETY.md` was completed (modest outfit, natural proportions, non-suggestive poses). Entries without it are ignored.
- Same-origin relative `.glb` paths only.

**Authoring guidelines (mobile)**
- Single skinned mesh set, <= 40k triangles (low) / 70k (medium) / 120k (high); textures <= 2048px (4096 only for high). Over budget => automatic fallback to the procedural avatar.
- Feet near the origin, facing +Z in glTF (the loader adds the 180 degree turn Babylon needs; use `yaw` to correct otherwise). Height is auto-fitted to `height`.
- Animations (in the model or in `animationsUrl`) are recognised by name: `idle`, `walk`, `run`, `jump`, `talk`. Use **in-place** clips (no root motion). Missing clips fall back run -> walk -> idle.
- Different skeleton? Shared clips are re-bound by normalised bone name (Mixamo, Armature|X, CC_Base, Bip01 prefixes are handled). Rest-pose differences between rigs are not corrected, so use rigs with the same T/A-pose.
- Compress textures (WebP/KTX2) and use Draco/meshopt only if the matching decoder is added later (not enabled in 22.1).

**Bundled (22.2-glb):** four Kenney *Mini Characters 2.0* models (CC0, see `KENNEY-LICENSE.txt`). They share `Textures/colormap.png` (referenced relatively by each `.glb`, so keep the folder layout). Their clips are named `idle`, `walk`, `sprint` (-> run), `jump` and `emote-yes` (-> talk).
