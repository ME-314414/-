import { mkdir, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import sharp from "sharp";

const publicRoot = join(process.cwd(), "public", "assets");
const outputRoot = join(publicRoot, "mobile");
const sourceRoots = [join(publicRoot, "showcase"), join(publicRoot, "collections")];

async function collectWebpFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return collectWebpFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".webp") ? [absolute] : [];
  }));
  return nested.flat();
}

const files = (await Promise.all(sourceRoots.map(collectWebpFiles))).flat();

await Promise.all(files.map(async (source) => {
  const destination = join(outputRoot, relative(publicRoot, source));
  await mkdir(dirname(destination), { recursive: true });
  await sharp(source)
    .resize({ width: 720, withoutEnlargement: true })
    .webp({ quality: 66, effort: 4 })
    .toFile(destination);
}));

console.log(`Generated ${files.length} mobile portfolio images.`);
