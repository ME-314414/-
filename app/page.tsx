"use client";

import { type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent, useEffect, useMemo, useRef, useState } from "react";
import Grainient from "./components/Grainient";
import BorderGlow from "./components/BorderGlow";
import MotionDirector from "./components/MotionDirector";
import { defaultCopy, defaultShowcase, getCustomWorks, PORTFOLIO_UPDATE_EVENT, readCopy, readHiddenWorks, type PortfolioCopy, type WorkItem } from "./lib/portfolio-content";
import { petBeautyWorks, sportsCommerceWorks, wildBeautyWorks } from "./lib/portfolio-batches";

const strengths = [
  { num: "01", title: "视觉创意", en: "VISUAL DIRECTION", text: "将抽象需求转化为可执行的视觉概念，兼顾品牌气质与传播效率。" },
  { num: "02", title: "提示词工程", en: "PROMPT SYSTEM", text: "拆解主体、场景、构图、镜头与约束，形成可复用、可跨模型的生产体系。" },
  { num: "03", title: "一致性控制", en: "CONSISTENCY", text: "控制角色、画风、光影与镜头连续性，稳定输出系列化视觉内容。" },
  { num: "04", title: "商业交付", en: "DELIVERY", text: "从需求确认到迭代复盘，以节点意识和标准化工作流保障项目落地。" },
];

const importedCollections = [
  {
    id: "wild-beauty",
    number: "02",
    en: "LUXURY BEAUTY × WILD NATURE",
    name: "高奢美妆野境",
    summary: "自然地貌 · 高奢产品 · 叙事镜头",
    description: "以自然野境、微距材质、宏观地貌与高奢产品建立差异化商业叙事。",
    className: "wild-beauty-cover",
    items: wildBeautyWorks,
  },
  {
    id: "sports-commerce",
    number: "03",
    en: "SPORTS COMMERCE VISUAL",
    name: "运动电商视觉",
    summary: "跑鞋装备 · 户外运动 · 电商转化",
    description: "覆盖鞋服、器材、汽车运动周边与电商套装的多品类营销视觉矩阵。",
    className: "sports-commerce-cover",
    items: sportsCommerceWorks,
  },
  {
    id: "pet-beauty",
    number: "04",
    en: "PET × BEAUTY CREATIVE",
    name: "萌宠美妆奇境",
    summary: "柯基角色 · 自然联名 · 跨品类创意",
    description: "以柯基角色为视觉线索，将自然气息、高端美妆语言与跨品类联名结合。",
    className: "pet-beauty-cover",
    items: petBeautyWorks,
  },
] as const;

type ArchiveId = "commercial" | "character" | "environment" | typeof importedCollections[number]["id"];
type ImportedArchiveId = typeof importedCollections[number]["id"];

function responsiveImageProps(item: WorkItem) {
  if (item.custom || !item.src.startsWith("/assets/")) return {};
  return {
    srcSet: `${item.src.replace("/assets/", "/assets/mobile/")} 720w, ${item.src} 1200w`,
    sizes: "(max-width: 620px) calc(100vw - 48px), (max-width: 1000px) 46vw, 34vw",
  };
}

export default function Home() {
  const [navFloating, setNavFloating] = useState(false);
  const navFloatingRef = useRef(false);
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [activeArchive, setActiveArchive] = useState<ArchiveId | null>("commercial");
  const [showAllWork, setShowAllWork] = useState(false);
  const [collectionLimits, setCollectionLimits] = useState<Record<ImportedArchiveId, number>>({ "wild-beauty": 12, "sports-commerce": 12, "pet-beauty": 12 });
  const [copy, setCopy] = useState<PortfolioCopy>(defaultCopy);
  const [hiddenWorks, setHiddenWorks] = useState<string[]>([]);
  const [customWorks, setCustomWorks] = useState<WorkItem[]>([]);
  const visibleWorks = useMemo(() => [...defaultShowcase.filter((item) => !hiddenWorks.includes(item.id)), ...customWorks], [hiddenWorks, customWorks]);
  const allPortfolioWorks = useMemo(() => [
    ...visibleWorks,
    ...wildBeautyWorks.filter((item) => !hiddenWorks.includes(item.id)),
    ...sportsCommerceWorks.filter((item) => !hiddenWorks.includes(item.id)),
    ...petBeautyWorks.filter((item) => !hiddenWorks.includes(item.id)),
  ], [visibleWorks, hiddenWorks]);
  const [marqueeWorks, setMarqueeWorks] = useState<WorkItem[]>(defaultShowcase.slice(0, 12));
  const [marqueeMounted, setMarqueeMounted] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const lightboxStageRef = useRef<HTMLDivElement>(null);
  const lightboxDragRef = useRef({ active: false, clientX: 0, clientY: 0 });
  const [lightboxView, setLightboxView] = useState({ scale: 1, x: 0, y: 0 });
  const [lightboxDragging, setLightboxDragging] = useState(false);

  useEffect(() => {
    let animationFrame = 0;
    const updateNavigation = () => {
      animationFrame = 0;
      const heroHeight = document.getElementById("top")?.offsetHeight ?? window.innerHeight;
      const nextFloating = window.scrollY >= heroHeight - 96;
      if (nextFloating !== navFloatingRef.current) {
        navFloatingRef.current = nextFloating;
        setNavFloating(nextFloating);
      }
    };

    const scheduleNavigationUpdate = () => {
      if (animationFrame === 0) animationFrame = window.requestAnimationFrame(updateNavigation);
    };

    updateNavigation();
    window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
    window.addEventListener("resize", scheduleNavigationUpdate);
    return () => {
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleNavigationUpdate);
      window.removeEventListener("resize", scheduleNavigationUpdate);
    };
  }, []);

  useEffect(() => {
    const shuffled = [...allPortfolioWorks];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    const mobileViewport = window.matchMedia("(max-width: 620px)").matches;
    setMarqueeWorks(shuffled.slice(0, mobileViewport ? 8 : 14));
  }, [allPortfolioWorks]);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || marqueeMounted) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMarqueeMounted(true);
        observer.disconnect();
      }
    }, { rootMargin: window.innerWidth <= 620 ? "160px 0px" : "600px 0px", threshold: 0 });
    observer.observe(marquee);
    return () => observer.disconnect();
  }, [marqueeMounted]);

  useEffect(() => {
    if (selectedWork === null) return;
    setLightboxView({ scale: 1, x: 0, y: 0 });
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedWork(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedWork]);

  const zoomLightbox = (nextScale: number, clientX?: number, clientY?: number) => {
    setLightboxView((current) => {
      const scale = Math.min(4, Math.max(1, nextScale));
      if (scale === 1) return { scale: 1, x: 0, y: 0 };
      const stage = lightboxStageRef.current;
      if (!stage || clientX === undefined || clientY === undefined) return { ...current, scale };
      const bounds = stage.getBoundingClientRect();
      const originX = clientX - bounds.left - bounds.width / 2;
      const originY = clientY - bounds.top - bounds.height / 2;
      const ratio = scale / current.scale;
      return {
        scale,
        x: current.x - (originX - current.x) * (ratio - 1),
        y: current.y - (originY - current.y) * (ratio - 1),
      };
    });
  };

  const handleLightboxWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    zoomLightbox(lightboxView.scale + direction * 0.28, event.clientX, event.clientY);
  };

  const handleLightboxPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (lightboxView.scale <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    lightboxDragRef.current = { active: true, clientX: event.clientX, clientY: event.clientY };
    setLightboxDragging(true);
  };

  const handleLightboxPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = lightboxDragRef.current;
    if (!drag.active) return;
    const deltaX = event.clientX - drag.clientX;
    const deltaY = event.clientY - drag.clientY;
    drag.clientX = event.clientX;
    drag.clientY = event.clientY;
    setLightboxView((current) => ({ ...current, x: current.x + deltaX, y: current.y + deltaY }));
  };

  const endLightboxDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    lightboxDragRef.current.active = false;
    setLightboxDragging(false);
  };

  useEffect(() => {
    let objectUrls: string[] = [];
    const loadEditableContent = async () => {
      setCopy(readCopy());
      setHiddenWorks(readHiddenWorks());
      objectUrls.forEach(URL.revokeObjectURL);
      const works = await getCustomWorks();
      objectUrls = works.map((item) => item.src);
      setCustomWorks(works);
    };
    void loadEditableContent();
    window.addEventListener(PORTFOLIO_UPDATE_EVENT, loadEditableContent);
    window.addEventListener("storage", loadEditableContent);
    return () => {
      window.removeEventListener(PORTFOLIO_UPDATE_EVENT, loadEditableContent);
      window.removeEventListener("storage", loadEditableContent);
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  return (
    <main>
      <MotionDirector />
      <section className="hero" id="top">
        <div className="opening-screen" aria-hidden="true">
          <div className="opening-panel opening-panel-top" />
          <div className="opening-panel opening-panel-bottom" />
          <div className="opening-copy">
            <p className="opening-kicker">INDEPENDENT CREATIVE PORTFOLIO · 2026</p>
            <div className="opening-name">
              <span>作品集展示</span>
              <small>PORTFOLIO SHOWCASE</small>
            </div>
            <div className="opening-progress"><i /></div>
            <div className="opening-count"><span>AI VISUAL DESIGN</span><b>00 — 100</b></div>
          </div>
        </div>
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster="/assets/hero-warm-v2.webp">
          <source src="/assets/hero-background-user.mp4" type="video/mp4" />
        </video>
        <div className="hero-image" />
        <div className="hero-shade" />
        <nav className={`nav shell${navFloating ? " nav-floating" : ""}`}>
          <a className="brand" href="#top" aria-label="返回首页"><span>M.</span><i>MENGXIANYI</i></a>
          <div className="nav-links">
            <a href="#about">ABOUT</a><a href="#work">WORK</a><a href="#ability">ABILITY</a>
          </div>
          <a className="contact-pill" href="mailto:1529853324@qq.com">GET IN TOUCH <span>↗</span></a>
        </nav>

        <div className="hero-content shell">
          <a className="studio-launch" href="/studio" aria-label="打开个人内容编辑后台">
            <span><i /> PRIVATE ACCESS</span>
            <b>OPEN STUDIO</b>
            <em>↗</em>
          </a>
          <div className="hero-title-group" style={{ "--hero-title-max": `${copy.heroTitleSize}px` } as CSSProperties}>
            <p className="hero-overline"><span>01</span> INDEPENDENT CREATIVE PORTFOLIO <i>2026</i></p>
            <h1>
              <span className="hero-line-mask"><span className="hero-title-top"><b>{copy.heroAi}</b><i>{copy.heroVisual}</i></span></span>
              <span className="hero-line-mask"><span className="hero-title-bottom">{copy.heroRole}<sup>®</sup></span></span>
            </h1>
            <div className="hero-title-foot"><p>视觉设计 / AIGC / 品牌内容</p><span>BASED IN JINAN · CN</span></div>
          </div>
          <div className="hero-side-copy">
            <span className="hero-side-label">DESIGN PHILOSOPHY <i>02</i></span>
            <strong>{copy.heroStatement}<br /><em>{copy.heroStatementAccent}</em></strong>
            <p>{copy.heroStatementBody}</p>
            <a href="#about">ABOUT THE DESIGNER <i>↘</i></a>
          </div>
          <a className="round-link" href="#work" aria-label="查看精选项目">↓</a>
        </div>
        <div className="hero-disciplines shell">
          <div><span>#01</span><b>Brand Strategy</b></div>
          <div><span>#02</span><b>AI Visual Design</b></div>
          <div><span>#03</span><b>Prompt System</b></div>
          <div><span>#04</span><b>Content Direction</b></div>
        </div>
      </section>

      <div className="post-hero">
        <div className="grainient-backdrop" aria-hidden="true">
          <div className="grainient-sticky">
            <Grainient
              color1="#5c2400"
              color2="#000000"
              color3="#97b1cf"
              timeSpeed={0.25}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>
        </div>
        <div className="post-hero-content">
      <section className="about section shell" id="about">
        <div className="section-label"><span>01</span> ABOUT ME</div>
        <div className="motion-section-title"><span>ABOUT</span><i>ME</i></div>
        <div className="about-grid">
          <BorderGlow className="portrait-border-glow" edgeSensitivity={24} glowColor="4 100 62" backgroundColor="#100807" borderRadius={24} glowRadius={48} glowIntensity={0.9} coneSpread={22} animated={false} colors={["#ff382d", "#ff9a5f", "#7f3028"]} fillOpacity={0.18}>
            <div className="portrait-wrap">
              <div className="portrait-glow" />
              <img src="/assets/about-character-3d.webp" alt="孟宪一的三维卡通设计师角色" width="1122" height="1402" loading="lazy" decoding="async" />
              <span className="portrait-note">DIGITAL TWIN / 01<br />AI VISUAL DESIGNER</span>
              <span className="portrait-badge">3D<br />AVATAR</span>
            </div>
          </BorderGlow>
          <div className="about-copy">
            <p className="kicker"><span>01 / PROFILE</span> AIGC 设计师 · AI 视觉 · 品牌内容</p>
            <h2>{copy.aboutTitle}<br /><i>{copy.aboutTitleAccent}</i></h2>
            <p className="lead">{copy.aboutLead}</p>
            <div className="about-chips"><span>ART DIRECTION</span><span>GENERATIVE VISUAL</span><span>BRAND SYSTEM</span></div>
            <div className="info-row"><span>LOCATION</span><b>中国 · 济南</b><em>↗</em></div>
            <div className="info-row"><span>FOCUS</span><b>AI 视觉 / 品牌设计 / 内容包装</b><em>↗</em></div>
            <div className="info-row"><span>EMAIL</span><a href="mailto:1529853324@qq.com">1529853324@qq.com</a><em>↗</em></div>
          </div>
        </div>
        <div className="work-marquee" ref={marqueeRef} aria-label="随机作品自动展示">
          <div className="work-marquee-track">
            {marqueeMounted ? [0, 1].map((group) => (
              <div className="work-marquee-group" key={group} aria-hidden={group === 1}>
                {marqueeWorks.map((item, index) => (
                  <button className={`marquee-card card-shape-${index % 5}`} type="button" key={`${group}-${item.id}`} onClick={() => setSelectedWork(item)} aria-label={`查看 ${item.brand} ${item.title}`} tabIndex={group === 1 ? -1 : 0}>
                    <img src={item.src} {...responsiveImageProps(item)} alt="" width={item.width ?? (item.custom ? undefined : 1086)} height={item.height ?? (item.custom ? undefined : 1448)} loading="lazy" decoding="async" />
                    <span>{item.brand}</span>
                  </button>
                ))}
              </div>
            )) : <div className="work-marquee-placeholder" />}
          </div>
        </div>
      </section>

      <section className="work section" id="work">
        <div className="shell section-heading">
          <div className="section-label"><span>02</span> SELECTED ARCHIVES</div>
          <div className="motion-section-title motion-title-work"><span>SELECTED</span><i>ARCHIVES</i></div>
          <div className="gallery-heading-row">
            <h2>作品不止被观看，<br /><i>也需要被整理。</i></h2>
            <div className="gallery-intro"><strong>06 / ARCHIVE</strong><p>以商业产品、高奢美妆、运动电商、萌宠联名、人物设定与环境参考建立六套独立档案。按需展开，让大量作品保持清晰、有序的浏览节奏。</p></div>
          </div>
        </div>

        <div className="archive-stack shell">
          <article className={`archive-drawer${activeArchive === "commercial" ? " is-open" : ""}`}>
            <button className="archive-trigger commercial-cover" type="button" aria-expanded={activeArchive === "commercial"} aria-controls="commercial-panel" onClick={() => setActiveArchive(activeArchive === "commercial" ? null : "commercial")}>
              <span className="archive-number">01</span>
              <span className="archive-name"><small>COMMERCIAL PRODUCT</small><b>商业产品设计</b></span>
              <span className="archive-summary">高奢美妆 · 热点产品创意矩阵</span>
              <span className="archive-count">{visibleWorks.length} WORKS</span>
              <span className="archive-toggle"><i />{activeArchive === "commercial" ? "收起" : "展开"}</span>
            </button>
            <div className="archive-panel" id="commercial-panel" hidden={activeArchive !== "commercial"}>
              <div className="archive-panel-head"><p>围绕英雄图、微距、俯拍、广角与动态瞬间建立的商业视觉系列。</p><span>{showAllWork ? "FULL COLLECTION" : `CURATED PREVIEW · ${String(Math.min(6, visibleWorks.length)).padStart(2, "0")}`}</span></div>
              <div className={`showcase-grid${showAllWork ? " is-complete" : ""}`}>
                {(showAllWork ? visibleWorks : visibleWorks.slice(0, 6)).map((item, index) => (
                  <button className={`showcase-item span-${index % 7}`} key={item.id} type="button" onClick={() => setSelectedWork(item)} aria-label={`查看 ${item.brand} ${item.title}`}>
                    <img src={item.src} {...responsiveImageProps(item)} alt={`${item.brand} ${item.title}`} width={item.width ?? (item.custom ? undefined : 1086)} height={item.height ?? (item.custom ? undefined : 1448)} loading="lazy" decoding="async" />
                    <span className="showcase-index">{item.custom ? "NEW" : item.id}</span>
                    <span className="showcase-overlay"><small>{item.brand}</small><b>{item.title}</b><i>VIEW ↗</i></span>
                  </button>
                ))}
              </div>
              {visibleWorks.length > 6 && <button className="archive-more" type="button" onClick={() => setShowAllWork(!showAllWork)}><span>{showAllWork ? "收起完整作品集" : `查看全部 ${visibleWorks.length} 张作品`}</span><i>{showAllWork ? "↑" : "↓"}</i></button>}
            </div>
          </article>

          {importedCollections.map((collection) => {
            const isOpen = activeArchive === collection.id;
            const limit = collectionLimits[collection.id];
            const collectionWorks = collection.items.filter((item) => !hiddenWorks.includes(item.id));
            const displayedWorks = collectionWorks.slice(0, limit);
            const hasMore = limit < collectionWorks.length;
            return (
              <article className={`archive-drawer${isOpen ? " is-open" : ""}`} key={collection.id}>
                <button className={`archive-trigger ${collection.className}`} type="button" aria-expanded={isOpen} aria-controls={`${collection.id}-panel`} onClick={() => setActiveArchive(isOpen ? null : collection.id)}>
                  <span className="archive-number">{collection.number}</span>
                  <span className="archive-name"><small>{collection.en}</small><b>{collection.name}</b></span>
                  <span className="archive-summary">{collection.summary}</span>
                  <span className="archive-count">{collectionWorks.length} WORKS</span>
                  <span className="archive-toggle"><i />{isOpen ? "收起" : "展开"}</span>
                </button>
                <div className="archive-panel" id={`${collection.id}-panel`} hidden={!isOpen}>
                  <div className="archive-panel-head"><p>{collection.description}</p><span>SHOWING {String(displayedWorks.length).padStart(2, "0")} / {collectionWorks.length}</span></div>
                  <div className={`showcase-grid${!hasMore ? " is-complete" : ""}`}>
                    {displayedWorks.map((item, index) => (
                      <button className={`showcase-item span-${index % 7}`} key={item.id} type="button" onClick={() => setSelectedWork(item)} aria-label={`查看 ${item.brand} ${item.title}`}>
                        <img src={item.src} {...responsiveImageProps(item)} alt={`${item.brand} ${item.title}`} width={item.width} height={item.height} loading="lazy" decoding="async" />
                        <span className="showcase-index">{item.id.replace(/^[^-]+-/, "")}</span>
                        <span className="showcase-overlay"><small>{item.brand}</small><b>{item.title}</b><i>VIEW ↗</i></span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="archive-more"
                    type="button"
                    onClick={() => setCollectionLimits((current) => ({ ...current, [collection.id]: hasMore ? Math.min(current[collection.id] + 12, collectionWorks.length) : 12 }))}
                  >
                    <span>{hasMore ? `继续加载 · 剩余 ${collectionWorks.length - displayedWorks.length} 张` : "收起至精选 12 张"}</span>
                    <i>{hasMore ? "↓" : "↑"}</i>
                  </button>
                </div>
              </article>
            );
          })}

          <article className={`archive-drawer${activeArchive === "character" ? " is-open" : ""}`}>
            <button className="archive-trigger character-cover" type="button" aria-expanded={activeArchive === "character"} aria-controls="character-panel" onClick={() => setActiveArchive(activeArchive === "character" ? null : "character")}>
              <span className="archive-number">05</span>
              <span className="archive-name"><small>CHARACTER BIBLE</small><b>人物设定集</b></span>
              <span className="archive-summary">角色造型 · 表情系统 · 视觉一致性</span>
              <span className="archive-count">COMING SOON</span>
              <span className="archive-toggle"><i />{activeArchive === "character" ? "收起" : "展开"}</span>
            </button>
            <div className="archive-panel" id="character-panel" hidden={activeArchive !== "character"}>
              <div className="archive-empty character-empty"><span>05 / CHARACTER BIBLE</span><h3>人物，由规则与细节共同成立。</h3><p>预留角色三视图、服装设定、表情变化与一致性测试作品位。</p><b>COLLECTION IN PROGRESS</b></div>
            </div>
          </article>

          <article className={`archive-drawer${activeArchive === "environment" ? " is-open" : ""}`}>
            <button className="archive-trigger environment-cover" type="button" aria-expanded={activeArchive === "environment"} aria-controls="environment-panel" onClick={() => setActiveArchive(activeArchive === "environment" ? null : "environment")}>
              <span className="archive-number">06</span>
              <span className="archive-name"><small>ENVIRONMENT STUDIES</small><b>环境参考集</b></span>
              <span className="archive-summary">空间气氛 · 材质光影 · 镜头语言</span>
              <span className="archive-count">COMING SOON</span>
              <span className="archive-toggle"><i />{activeArchive === "environment" ? "收起" : "展开"}</span>
            </button>
            <div className="archive-panel" id="environment-panel" hidden={activeArchive !== "environment"}>
              <div className="archive-empty environment-empty"><span>06 / ENVIRONMENT STUDIES</span><h3>先建立世界，再让故事发生。</h3><p>预留场景气氛、空间概念、材质实验与镜头参考作品位。</p><b>COLLECTION IN PROGRESS</b></div>
            </div>
          </article>
        </div>
      </section>

      {selectedWork !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="作品大图预览" onClick={() => setSelectedWork(null)}>
          <button className="lightbox-close" type="button" onClick={() => setSelectedWork(null)} aria-label="关闭预览">×</button>
          <div className="lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <div
              ref={lightboxStageRef}
              className={`lightbox-stage${lightboxView.scale > 1 ? " is-zoomed" : ""}${lightboxDragging ? " is-dragging" : ""}`}
              onWheel={handleLightboxWheel}
              onPointerDown={handleLightboxPointerDown}
              onPointerMove={handleLightboxPointerMove}
              onPointerUp={endLightboxDrag}
              onPointerCancel={endLightboxDrag}
              onDoubleClick={(event) => zoomLightbox(lightboxView.scale > 1 ? 1 : 2.25, event.clientX, event.clientY)}
            >
              <img
                className="lightbox-image"
                src={selectedWork.src}
                alt={`${selectedWork.brand} ${selectedWork.title}`}
                decoding="async"
                draggable={false}
                style={{ transform: `translate3d(calc(-50% + ${lightboxView.x}px), calc(-50% + ${lightboxView.y}px), 0) scale(${lightboxView.scale})` }}
              />
              <div className="lightbox-tools" aria-label="图片缩放工具">
                <button type="button" onClick={() => zoomLightbox(lightboxView.scale - 0.4)} aria-label="缩小图片">−</button>
                <output>{Math.round(lightboxView.scale * 100)}%</output>
                <button type="button" onClick={() => zoomLightbox(lightboxView.scale + 0.4)} aria-label="放大图片">＋</button>
                <button className="lightbox-reset" type="button" onClick={() => zoomLightbox(1)}>复位</button>
              </div>
            </div>
            <div className="lightbox-meta"><span>{selectedWork.custom ? "NEW" : selectedWork.id} / {allPortfolioWorks.length}</span><div><small>{selectedWork.brand}</small><h3>{selectedWork.title}</h3></div><p>AI PRODUCT VISUAL<br />CURATED PORTFOLIO SERIES</p></div>
          </div>
        </div>
      )}

      <section className="ability section shell" id="ability">
        <div className="section-label"><span>03</span> WHAT I DO</div>
        <div className="motion-section-title motion-title-ability"><span>CREATIVE</span><i>SYSTEMS</i></div>
        <div className="ability-title"><h2>能力不是标签，<br /><i>而是解决问题的方式。</i></h2><p>以审美判断为核心，以生成技术为工具，建立从策略到交付的完整闭环。</p></div>
        <div className="strength-grid">
          {strengths.map((item) => (
            <article className="strength-card" key={item.num}>
              <span className="strength-num">{item.num}</span><div className="strength-icon">✦</div>
              <small>{item.en}</small><h3>{item.title}</h3><p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="contact-section" id="contact">
        <div className="contact-glow" />
        <div className="shell contact-inner">
          <p className="eyebrow"><span /> HAVE A PROJECT IN MIND?</p>
          <h2>LET&apos;S CREATE<br /><em>SOMETHING</em> GREAT.</h2>
          <div className="contact-bottom">
            <div><span>EMAIL</span><a href="mailto:1529853324@qq.com">1529853324@qq.com ↗</a></div>
            <div><span>PHONE</span><a href="tel:+8619353184990">+86 193 5318 4990</a></div>
            <a className="contact-circle" href="mailto:1529853324@qq.com">START A<br />PROJECT ↗</a>
          </div>
        </div>
        <div className="footer-line shell"><span>© 2026 MENG XIANYI</span><span>VISUAL × AI × BRAND</span><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
        </div>
      </div>
    </main>
  );
}
