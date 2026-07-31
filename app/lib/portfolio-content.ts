export type WorkItem = {
  id: string;
  src: string;
  brand: string;
  title: string;
  width?: number;
  height?: number;
  custom?: boolean;
};

export type PortfolioCopy = {
  heroAi: string;
  heroVisual: string;
  heroRole: string;
  heroStatement: string;
  heroStatementAccent: string;
  heroStatementBody: string;
  heroTitleSize: number;
  aboutTitle: string;
  aboutTitleAccent: string;
  aboutLead: string;
};

export const defaultCopy: PortfolioCopy = {
  heroAi: "AI",
  heroVisual: "Visual",
  heroRole: "Designer",
  heroStatement: "Make technology",
  heroStatementAccent: "feel human.",
  heroStatementBody: "让技术成为创意的语言，而不是创意的边界。",
  heroTitleSize: 130,
  aboutTitle: "以视觉定义秩序，",
  aboutTitleAccent: "让想象持续发生。",
  aboutLead: "我是孟宪一，专注于生成式视觉与品牌内容设计。将创意判断、结构化提示词和多模型工作流连接起来，让每一次大胆想象，都能稳定地成为可交付的视觉成果。",
};

export const defaultShowcase: WorkItem[] = [
  ["CHANEL", "紫莓风场英雄图"], ["CHANEL", "覆露紫莓微距"], ["CHANEL", "鸢尾花环俯拍"], ["CHANEL", "暮色雪松广角"], ["CHANEL", "香雾彩虹瞬间"],
  ["DIOR", "粉冰峡谷英雄图"], ["DIOR", "樱瓣润泽微距"], ["DIOR", "春溪花序俯拍"], ["DIOR", "高山樱雪广角"], ["DIOR", "冰河粉雾爆发"],
  ["YSL", "无花果拱门英雄图"], ["YSL", "果肉水光微距"], ["YSL", "黑银粉三角俯拍"], ["YSL", "月夜庭院广角"], ["YSL", "雨池升起瞬间"],
  ["GIVENCHY", "粉彩盐湖英雄图"], ["GIVENCHY", "矿粉云微距"], ["GIVENCHY", "四色地貌俯拍"], ["GIVENCHY", "粉雾荒漠广角"], ["GIVENCHY", "四色风暴瞬间"],
  ["ARMANI", "丝绸沙丘英雄图"], ["ARMANI", "肤光液带微距"], ["ARMANI", "岩色等高线俯拍"], ["ARMANI", "海崖风场广角"], ["ARMANI", "液态丝带瞬间"],
].map(([brand, title], index) => ({
  id: String(index + 1).padStart(2, "0"),
  src: `/assets/showcase/beauty-${String(index + 1).padStart(2, "0")}.webp`,
  brand,
  title,
})).filter((item) => item.id !== "07");

const COPY_KEY = "meng-portfolio-copy-v1";
const HIDDEN_KEY = "meng-portfolio-hidden-v1";
export const PORTFOLIO_UPDATE_EVENT = "portfolio-content-updated";

export function readCopy(): PortfolioCopy {
  if (typeof window === "undefined") return defaultCopy;
  try {
    const saved = JSON.parse(localStorage.getItem(COPY_KEY) || "{}");
    return { ...defaultCopy, ...saved };
  } catch {
    return defaultCopy;
  }
}

export function saveCopy(copy: PortfolioCopy) {
  localStorage.setItem(COPY_KEY, JSON.stringify(copy));
  window.dispatchEvent(new Event(PORTFOLIO_UPDATE_EVENT));
}

export function readHiddenWorks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHiddenWorks(ids: string[]) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(PORTFOLIO_UPDATE_EVENT));
}

type StoredWork = { id: string; brand: string; title: string; image: Blob; createdAt: number };
const DB_NAME = "meng-portfolio-studio";
const STORE_NAME = "works";

function openWorksDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCustomWorks(): Promise<WorkItem[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openWorksDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result as StoredWork[]).sort((a, b) => b.createdAt - a.createdAt).map((item) => ({ id: item.id, brand: item.brand, title: item.title, src: URL.createObjectURL(item.image), custom: true })));
    request.onerror = () => reject(request.error);
  });
}

export async function addCustomWork(brand: string, title: string, image: Blob) {
  const db = await openWorksDb();
  const item: StoredWork = { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, brand, title, image, createdAt: Date.now() };
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  window.dispatchEvent(new Event(PORTFOLIO_UPDATE_EVENT));
}

export async function deleteCustomWork(id: string) {
  const db = await openWorksDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  window.dispatchEvent(new Event(PORTFOLIO_UPDATE_EVENT));
}

export async function optimizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("图片处理失败")), "image/webp", .86));
}
