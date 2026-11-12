import test from "node:test";
import assert from "node:assert/strict";
import { canonicalBone, classifyClip, pickClips, resolveState, frameState, computeFit, withinBudget } from "../src/avatar-rig";
import { parseManifest } from "../src/avatar-manifest";

test("canonicalBone unifies common rig naming", () => {
  const arm = ["mixamorig:LeftArm", "mixamorig9LeftArm", "Armature|LeftArm", "LeftUpperArm", "CC_Base_L_Upperarm", "Bip01 L UpperArm"];
  const keys = new Set(arm.map(canonicalBone));
  assert.equal(keys.size, 1, [...keys].join(","));
  assert.notEqual(canonicalBone("mixamorig:RightArm"), canonicalBone("mixamorig:LeftArm"));
  assert.equal(canonicalBone("mixamorig:LeftUpLeg"), canonicalBone("LeftThigh"));
});
test("classifyClip", () => {
  assert.equal(classifyClip("Armature|Walking"), "walk");
  assert.equal(classifyClip("Run_Fast"), "run");
  assert.equal(classifyClip("mixamo.com"), null);
  assert.equal(classifyClip("Idle_01"), "idle");
  assert.equal(classifyClip("Jump"), "jump");
  assert.equal(classifyClip("Talking_2"), "talk");
});
test("pickClips + resolveState fallback chain", () => {
  const p = pickClips([{ name: "Idle" }, { name: "Walk" }]);
  assert.equal(resolveState("run", p), "walk");
  assert.equal(resolveState("jump", p), "idle");
  assert.equal(resolveState("talk", p), "idle");
  assert.equal(resolveState("idle", {}), null);
  assert.equal(pickClips([{ name: "mixamo.com" }]).idle?.name, "mixamo.com");
});
test("frameState priorities", () => {
  assert.equal(frameState(true, true, false), "jump");
  assert.equal(frameState(true, true, true), "run");
  assert.equal(frameState(true, false, true), "walk");
  assert.equal(frameState(false, false, true), "idle");
  assert.equal(frameState(false, false, true, true), "talk");
});
test("computeFit puts feet on ground and scales to height", () => {
  const f = computeFit(0.5, 2.5, 0, 1.8)!;           // 2 units tall, feet 0.5 above holder
  assert.ok(Math.abs(f.scale - 0.9) < 1e-9);
  assert.ok(Math.abs(f.offsetY - -0.45) < 1e-9);
  assert.equal(computeFit(1, 1, 0, 1.8), null);
  assert.equal(computeFit(NaN, 2, 0, 1.8), null);
});
test("budgets", () => {
  assert.equal(withinBudget(30000, 2048, "low"), null);
  assert.match(withinBudget(50000, 1024, "low")!, /triangles/);
  assert.match(withinBudget(1000, 4096, "medium")!, /texture/);
  assert.equal(withinBudget(100000, 4096, "high"), null);
});
test("manifest accepts only reviewed same-origin .glb entries", () => {
  const ok = { id: "a-1", name: "A", url: "a.glb", safetyReviewed: true };
  const bad = [
    { ...ok, safetyReviewed: false }, { ...ok, safetyReviewed: undefined }, { ...ok, url: "https://x.com/a.glb" },
    { ...ok, url: "/a.glb" }, { ...ok, url: "../a.glb" }, { ...ok, url: "a.exe" }, { ...ok, id: "Bad Id" },
    { ...ok, animationsUrl: "http://evil/x.glb" }, null, 5
  ];
  const r = parseManifest({ models: [ok, ...bad] });
  assert.equal(r.length, 1);
  assert.equal(r[0]!.height, 1.85);
  assert.deepEqual(parseManifest(null), []);
  assert.deepEqual(parseManifest({ models: "x" }), []);
  assert.equal(parseManifest({ models: [{ ...ok, height: 9 }] })[0]!.height, 1.85);
});

test("Kenney Mini Characters clip names map to avatar states", () => {
  const names = ["static","idle","walk","sprint","jump","fall","crouch","sit","drive","die","pick-up","emote-yes","emote-no",
    "holding-right","holding-both-shoot","attack-melee-right","attack-kick-left","interact-right","wheelchair-sit","wheelchair-move-forward"];
  const picked = pickClips(names.map((name) => ({ name })));
  assert.equal(picked.idle?.name, "idle");
  assert.equal(picked.walk?.name, "walk");
  assert.equal(picked.run?.name, "sprint");
  assert.equal(picked.jump?.name, "jump");
  assert.equal(picked.talk?.name, "emote-yes");
  for (const n of ["static","fall","crouch","sit","drive","die","emote-no","holding-right","attack-melee-right","interact-right","wheelchair-sit"])
    assert.equal(classifyClip(n), null, n);
});

test("shipped manifest.json is valid and every referenced file exists", async () => {
  const { readFileSync, existsSync } = await import("node:fs");
  const raw = JSON.parse(readFileSync("public/avatars/manifest.json", "utf8"));
  const models = parseManifest(raw);
  assert.equal(models.length, raw.models.length, "no entry may be silently dropped");
  assert.ok(models.length >= 1);
  for (const m of models) {
    assert.ok(existsSync(`public/avatars/${m.url}`), m.url);
    const glb = readFileSync(`public/avatars/${m.url}`);
    assert.equal(glb.subarray(0, 4).toString("latin1"), "glTF", m.url);
  }
  assert.ok(existsSync("public/avatars/Textures/colormap.png"));
});

test("campus wings: footprints, facing and no overlap with trees or each other", async () => {
  const { wingFootprint, rectsOverlap, localToWorld, facingYaw } = await import("../src/campus-layout");
  const lib = wingFootprint(-44, 14, 15, 10, 0.3), lab = wingFootprint(44, 14, 15, 10, 0.3);
  assert.deepEqual([lib.minX, lib.maxX, lib.minZ, lib.maxZ], [-49.3, -38.7, 6.2, 21.8]);
  assert.equal(rectsOverlap(lib, lab), false);
  const trees = [[-36, 6], [36, 6], [-38, 31], [38, 31], [-38, -25], [38, -25]];
  for (const [x, z] of trees) for (const r of [lib, lab])
    assert.equal(rectsOverlap(r, { minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.7, maxZ: z + 0.7 }), false, `${x},${z}`);
  // The front (-Z local) must point at the courtyard: library door looks +X, lab door looks -X.
  const f1 = localToWorld(-44, 14, "east", 0, -5), f2 = localToWorld(44, 14, "west", 0, -5);
  assert.ok(Math.abs(f1.x - -39) < 1e-9 && Math.abs(f1.z - 14) < 1e-9);
  assert.ok(Math.abs(f2.x - 39) < 1e-9 && Math.abs(f2.z - 14) < 1e-9);
  assert.equal(facingYaw("east"), -Math.PI / 2);
  // Inside the 120x120 lawn (+-60).
  for (const r of [lib, lab]) assert.ok(r.minX > -60 && r.maxX < 60 && r.minZ > -60 && r.maxZ < 60);
});
