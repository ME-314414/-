import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const batches = [
  {
    exportName: "wildBeautyWorks",
    idPrefix: "wild",
    source: "D:/Codex图像生成/2.批次项目/0731-20.47-高奢美妆自然野境/V01-高奢美妆自然野境-二十组差异化创意-100张",
    output: "public/assets/collections/wild-beauty",
    publicPath: "/assets/collections/wild-beauty",
    expected: 100,
    accept: (filename) => /^\d+-高奢美妆自然野境-/.test(filename),
    brand: "LUXURY BEAUTY × WILD NATURE",
    title(filename) {
      return filename.replace(/^\d+-高奢美妆自然野境-/, "").replace(/\.(png|jpe?g|webp)$/i, "");
    },
  },
  {
    exportName: "sportsCommerceWorks",
    idPrefix: "sport",
    source: "D:/Codex图像生成/2.批次项目/0730-22.57-多品类运动电商视觉/V01-多品类运动营销-户外特写电商矩阵-105张",
    output: "public/assets/collections/sports-commerce",
    publicPath: "/assets/collections/sports-commerce",
    expected: 101,
    maxNumber: 105,
    accept: (filename) => /^\d+-[^-]+-[^-]+/.test(filename),
    brand(filename) {
      return filename.replace(/^\d+-/, "").split("-")[0].replace(/\.(png|jpe?g|webp)$/i, "");
    },
    title(filename) {
      return filename.replace(/^\d+-[^-]+-/, "").replace(/\.(png|jpe?g|webp)$/i, "");
    },
  },
  {
    exportName: "petBeautyWorks",
    idPrefix: "pet",
    source: "D:/Codex图像生成/2.批次项目/0731-20.46-柯基自然高端周边/V01-柯基自然高端联名-二十组跨品类视觉-100张",
    output: "public/assets/collections/pet-beauty",
    publicPath: "/assets/collections/pet-beauty",
    expected: 98,
    accept: (filename) => /^\d+-[^-]+-[^-]+/.test(filename),
    brand(filename) {
      return filename.replace(/^\d+-/, "").split("-")[0].replace(/\.(png|jpe?g|webp)$/i, "");
    },
    title(filename) {
      return filename.replace(/^\d+-[^-]+-/, "").replace(/\.(png|jpe?g|webp)$/i, "");
    },
  },
];

async function listImages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listImages(fullPath);
    return /\.(png|jpe?g|webp)$/i.test(entry.name) ? [fullPath] : [];
  }));
  return nested.flat();
}

function selectNumberedWorks(files, expected, maxNumber = expected) {
  const selected = new Map();
  for (const file of files) {
    const match = path.basename(file).match(/^(\d+)-/);
    if (!match) continue;
    const number = Number(match[1]);
    if (number < 1 || number > maxNumber) continue;
    const previous = selected.get(number);
    if (!previous || path.extname(file).toLowerCase() === ".png") selected.set(number, file);
  }
  const ordered = [...selected.entries()].sort((a, b) => a[0] - b[0]);
  if (ordered.length !== expected) {
    const missing = Array.from({ length: maxNumber }, (_, index) => index + 1).filter((number) => !selected.has(number));
    throw new Error(`Expected ${expected} numbered works, found ${ordered.length}. Missing numbers: ${missing.join(", ")}`);
  }
  return ordered;
}

async function runPool(items, worker, concurrency = 4) {
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  }));
}

const manifest = [];
let sourceBytes = 0;
let outputBytes = 0;

for (const batch of batches) {
  const files = (await listImages(batch.source)).filter((file) => batch.accept(path.basename(file)));
  const numberedWorks = selectNumberedWorks(files, batch.expected, batch.maxNumber);
  await fs.mkdir(batch.output, { recursive: true });
  const items = new Array(numberedWorks.length);

  await runPool(numberedWorks, async ([number, sourceFile], index) => {
    const padded = String(number).padStart(3, "0");
    const outputFile = path.join(batch.output, `${batch.idPrefix}-${padded}.webp`);
    const sourceStat = await fs.stat(sourceFile);
    sourceBytes += sourceStat.size;
    const info = await sharp(sourceFile)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 4, smartSubsample: true })
      .toFile(outputFile);
    outputBytes += info.size;
    const filename = path.basename(sourceFile);
    items[index] = {
      id: `${batch.idPrefix}-${padded}`,
      src: `${batch.publicPath}/${batch.idPrefix}-${padded}.webp`,
      brand: typeof batch.brand === "function" ? batch.brand(filename) : batch.brand,
      title: batch.title(filename),
      width: info.width,
      height: info.height,
    };
  });

  manifest.push(`export const ${batch.exportName}: WorkItem[] = ${JSON.stringify(items, null, 2)};`);
  console.log(`${batch.exportName}: ${items.length} works`);
}

const output = `import type { WorkItem } from "./portfolio-content";\n\n${manifest.join("\n\n")}\n`;
await fs.writeFile("app/lib/portfolio-batches.ts", output, "utf8");
console.log(`Source: ${(sourceBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`Web: ${(outputBytes / 1024 / 1024).toFixed(1)} MB`);
