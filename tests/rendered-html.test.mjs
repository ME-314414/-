import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("defines the three imported portfolio collections", async () => {
  const [page, batches] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/portfolio-batches.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /高奢美妆野境/);
  assert.match(page, /运动电商视觉/);
  assert.match(page, /萌宠美妆奇境/);
  assert.match(page, /collectionLimits/);
  assert.match(page, /继续加载/);
  assert.equal((batches.match(/"id": "wild-/g) ?? []).length, 100);
  assert.equal((batches.match(/"id": "sport-/g) ?? []).length, 101);
  assert.equal((batches.match(/"id": "pet-/g) ?? []).length, 98);
  assert.doesNotMatch(batches, /参考/);
});

test("ships optimized WebP assets for every imported work", async () => {
  const collections = [
    ["wild-beauty", 100],
    ["sports-commerce", 101],
    ["pet-beauty", 98],
  ];

  for (const [directory, expected] of collections) {
    const root = new URL(`../public/assets/collections/${directory}/`, import.meta.url);
    const files = (await readdir(root)).filter((file) => file.endsWith(".webp"));
    assert.equal(files.length, expected);
    const sizes = await Promise.all(files.map((file) => stat(new URL(file, root)).then((item) => item.size)));
    assert.ok(sizes.every((size) => size > 0));
    assert.ok(sizes.every((size) => size < 550 * 1024));
  }

  const importer = await readFile(new URL("../scripts/import-portfolio-batches.mjs", import.meta.url), "utf8");
  assert.match(importer, /\.webp\(\{ quality: 78/);
  assert.ok(projectRoot);
});
