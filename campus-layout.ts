// Pure layout helpers for the campus wings (no Babylon imports, unit-tested in Node).
export type Facing = "east" | "west";          // direction the wing's front door looks at
export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

// Local space: front of the building is -Z (same as the main academy). Rotation about Y maps it to world.
export const facingYaw = (f: Facing) => (f === "east" ? -Math.PI / 2 : Math.PI / 2);

// World-space axis-aligned footprint of a wing of local size (width x depth) centred at (cx, cz).
export function wingFootprint(cx: number, cz: number, width: number, depth: number, margin = 0): Rect {
  // Both supported facings turn the building by 90 degrees: local width runs along world Z.
  const hx = depth / 2 + margin, hz = width / 2 + margin;
  return { minX: cx - hx, maxX: cx + hx, minZ: cz - hz, maxZ: cz + hz };
}
export const rectsOverlap = (a: Rect, b: Rect) =>
  a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;

// Local (lx, lz) -> world (x, z) for a wing at (cx, cz) with the given facing (Babylon: left-handed Y rotation).
export function localToWorld(cx: number, cz: number, facing: Facing, lx: number, lz: number) {
  const t = facingYaw(facing);
  return { x: cx + lx * Math.cos(t) + lz * Math.sin(t), z: cz - lx * Math.sin(t) + lz * Math.cos(t) };
}
