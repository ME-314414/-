"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { addCustomWork, defaultCopy, defaultShowcase, deleteCustomWork, getCustomWorks, optimizeImage, readCopy, readHiddenWorks, saveCopy, saveHiddenWorks, type PortfolioCopy, type WorkItem } from "../lib/portfolio-content";
import { petBeautyWorks, sportsCommerceWorks, wildBeautyWorks } from "../lib/portfolio-batches";
import "./studio.css";

const STUDIO_PASSWORD = "314414";
const builtInGroups = [
  { id: "commercial", label: "商业产品", items: defaultShowcase },
  { id: "wild-beauty", label: "高奢美妆野境", items: wildBeautyWorks },
  { id: "sports-commerce", label: "运动电商视觉", items: sportsCommerceWorks },
  { id: "pet-beauty", label: "萌宠美妆奇境", items: petBeautyWorks },
] as const;
type BuiltInGroupId = typeof builtInGroups[number]["id"];

export default function StudioPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"copy" | "works">("copy");
  const [activeBuiltInGroup, setActiveBuiltInGroup] = useState<BuiltInGroupId>("commercial");
  const [copy, setCopyDraft] = useState<PortfolioCopy>(defaultCopy);
  const [hiddenWorks, setHiddenWorks] = useState<string[]>([]);
  const [customWorks, setCustomWorks] = useState<WorkItem[]>([]);
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const customWorksRef = useRef<WorkItem[]>([]);

  const loadWorks = async () => {
    const next = await getCustomWorks();
    customWorksRef.current.forEach((item) => URL.revokeObjectURL(item.src));
    customWorksRef.current = next;
    setCustomWorks(next);
  };

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem("portfolio-studio-auth") === "true");
    setCopyDraft(readCopy());
    setHiddenWorks(readHiddenWorks());
    void loadWorks();
    return () => customWorksRef.current.forEach((item) => URL.revokeObjectURL(item.src));
  }, []);

  const login = (event: FormEvent) => {
    event.preventDefault();
    if (password !== STUDIO_PASSWORD) {
      setLoginError("密码不正确，请重新输入");
      setPassword("");
      return;
    }
    sessionStorage.setItem("portfolio-studio-auth", "true");
    setAuthenticated(true);
    setLoginError("");
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const updateCopy = <K extends keyof PortfolioCopy>(key: K, value: PortfolioCopy[K]) => setCopyDraft((current) => ({ ...current, [key]: value }));

  const saveText = () => {
    saveCopy(copy);
    showNotice("文字设置已保存");
  };

  const toggleBuiltInWork = (id: string) => {
    const next = hiddenWorks.includes(id) ? hiddenWorks.filter((item) => item !== id) : [...hiddenWorks, id];
    setHiddenWorks(next);
    saveHiddenWorks(next);
  };

  const uploadWork = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !brand.trim() || !title.trim()) return;
    setBusy(true);
    try {
      const image = await optimizeImage(file);
      await addCustomWork(brand.trim(), title.trim(), image);
      await loadWorks();
      setBrand("");
      setTitle("");
      setFile(null);
      const input = document.getElementById("studio-file") as HTMLInputElement | null;
      if (input) input.value = "";
      showNotice("新作品已添加");
    } finally {
      setBusy(false);
    }
  };

  const removeCustomWork = async (item: WorkItem) => {
    if (!window.confirm(`确定删除「${item.title}」吗？删除后无法恢复。`)) return;
    await deleteCustomWork(item.id);
    await loadWorks();
    showNotice("作品已删除");
  };

  if (authenticated === null) return <main className="studio-loading">STUDIO LOADING</main>;

  if (!authenticated) {
    return (
      <main className="studio-login">
        <div className="login-orbit" />
        <a className="studio-back" href="/">← 返回作品集</a>
        <form className="login-card" onSubmit={login}>
          <div className="login-mark"><span>M.</span><i>PRIVATE STUDIO</i></div>
          <p className="login-index">01 / AUTHORIZATION</p>
          <h1>进入你的<br /><em>内容控制室。</em></h1>
          <p className="login-copy">请输入六位管理密码。登录后可以修改页面文字、字号与商业作品图片。</p>
          <label htmlFor="studio-password">ACCESS CODE</label>
          <div className={`password-box${loginError ? " has-error" : ""}`}>
            <input id="studio-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value.replace(/\D/g, "").slice(0, 6)); setLoginError(""); }} inputMode="numeric" autoComplete="current-password" maxLength={6} placeholder="••••••" autoFocus />
            <span>{password.length} / 6</span>
          </div>
          {loginError && <p className="login-error">{loginError}</p>}
          <button type="submit" disabled={password.length !== 6}>ENTER STUDIO <span>↗</span></button>
          <small>DEVICE-LOCAL EDITOR · SESSION PROTECTED</small>
        </form>
      </main>
    );
  }

  return (
    <main className="studio-app">
      {notice && <div className="studio-notice">{notice} <span>✓</span></div>}
      <aside className="studio-sidebar">
        <a className="studio-logo" href="/"><b>M.</b><span>MENGXIANYI</span></a>
        <div className="studio-nav-label">CONTENT SYSTEM</div>
        <nav>
          <button className={activeTab === "copy" ? "active" : ""} onClick={() => setActiveTab("copy")}><span>01</span>文字与排版<i>↗</i></button>
          <button className={activeTab === "works" ? "active" : ""} onClick={() => setActiveTab("works")}><span>02</span>作品图片管理<i>↗</i></button>
        </nav>
        <div className="studio-sidebar-bottom">
          <a href="/" target="_blank">预览公开网站 <span>↗</span></a>
          <button onClick={() => { sessionStorage.removeItem("portfolio-studio-auth"); setAuthenticated(false); }}>退出登录</button>
        </div>
      </aside>

      <section className="studio-main">
        <header className="studio-header"><div><span>PRIVATE EDITOR / 2026</span><h1>{activeTab === "copy" ? "文字与排版" : "作品图片管理"}</h1></div><p>所有修改仅保存在当前设备<br />保存后刷新公开页面即可查看</p></header>

        {activeTab === "copy" && (
          <div className="studio-content">
            <div className="editor-section-title"><span>01</span><div><h2>首屏主标题</h2><p>修改首页最重要的身份标题和视觉比例。</p></div></div>
            <div className="editor-grid three">
              <label><span>第一关键词</span><input value={copy.heroAi} onChange={(event) => updateCopy("heroAi", event.target.value)} /></label>
              <label><span>强调词</span><input value={copy.heroVisual} onChange={(event) => updateCopy("heroVisual", event.target.value)} /></label>
              <label><span>职业标题</span><input value={copy.heroRole} onChange={(event) => updateCopy("heroRole", event.target.value)} /></label>
            </div>
            <label className="range-field"><span>主标题大小 <b>{copy.heroTitleSize}px</b></span><input type="range" min="100" max="160" value={copy.heroTitleSize} onChange={(event) => updateCopy("heroTitleSize", Number(event.target.value))} /></label>

            <div className="editor-section-title"><span>02</span><div><h2>首屏设计宣言</h2><p>控制首屏右侧英文主张与中文说明。</p></div></div>
            <div className="editor-grid two">
              <label><span>英文主句</span><input value={copy.heroStatement} onChange={(event) => updateCopy("heroStatement", event.target.value)} /></label>
              <label><span>红色强调句</span><input value={copy.heroStatementAccent} onChange={(event) => updateCopy("heroStatementAccent", event.target.value)} /></label>
            </div>
            <label><span>中文说明</span><textarea rows={3} value={copy.heroStatementBody} onChange={(event) => updateCopy("heroStatementBody", event.target.value)} /></label>

            <div className="editor-section-title"><span>03</span><div><h2>个人介绍</h2><p>修改第二屏主标题与个人简介。</p></div></div>
            <div className="editor-grid two">
              <label><span>介绍标题</span><input value={copy.aboutTitle} onChange={(event) => updateCopy("aboutTitle", event.target.value)} /></label>
              <label><span>红色强调标题</span><input value={copy.aboutTitleAccent} onChange={(event) => updateCopy("aboutTitleAccent", event.target.value)} /></label>
            </div>
            <label><span>个人简介</span><textarea rows={5} value={copy.aboutLead} onChange={(event) => updateCopy("aboutLead", event.target.value)} /></label>
            <div className="studio-actions"><button className="secondary" onClick={() => setCopyDraft(defaultCopy)}>恢复默认文字</button><button className="primary" onClick={saveText}>保存全部修改 <span>↗</span></button></div>
          </div>
        )}

        {activeTab === "works" && (
          <div className="studio-content">
            <div className="editor-section-title"><span>01</span><div><h2>添加商业作品</h2><p>上传后会自动压缩，并加入商业产品设计档案。</p></div></div>
            <form className="upload-panel" onSubmit={uploadWork}>
              <label className="upload-drop" htmlFor="studio-file"><input id="studio-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} /><b>{file ? file.name : "选择一张作品图片"}</b><span>JPG / PNG / WEBP · 建议使用高清竖图或横图</span></label>
              <div className="upload-fields"><label><span>品牌或系列</span><input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="例如 CHANEL" /></label><label><span>作品标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如 紫莓风场主视觉" /></label><button type="submit" disabled={busy || !file || !brand.trim() || !title.trim()}>{busy ? "正在处理…" : "添加到作品集"} <span>＋</span></button></div>
            </form>

            {customWorks.length > 0 && <><div className="editor-section-title"><span>02</span><div><h2>你添加的作品</h2><p>这些图片保存在当前浏览器的本地图片库。</p></div></div><div className="manage-grid">{customWorks.map((item) => <article key={item.id}><img src={item.src} alt={item.title} loading="lazy" decoding="async" /><div><small>{item.brand}</small><h3>{item.title}</h3><button onClick={() => void removeCustomWork(item)}>删除</button></div></article>)}</div></>}

            <div className="editor-section-title"><span>{customWorks.length > 0 ? "03" : "02"}</span><div><h2>现有分类作品</h2><p>按分类管理站内作品；隐藏不会删除原始图片，可以随时恢复显示。</p></div></div>
            <div className="manage-filter" role="tablist" aria-label="作品分类">
              {builtInGroups.map((group) => <button className={activeBuiltInGroup === group.id ? "active" : ""} type="button" role="tab" aria-selected={activeBuiltInGroup === group.id} key={group.id} onClick={() => setActiveBuiltInGroup(group.id)}>{group.label}<span>{group.items.length}</span></button>)}
            </div>
            <div className="manage-grid built-in">{builtInGroups.find((group) => group.id === activeBuiltInGroup)!.items.map((item) => { const hidden = hiddenWorks.includes(item.id); return <article className={hidden ? "is-hidden" : ""} key={item.id}><img src={item.src} alt={item.title} width={item.width ?? 1086} height={item.height ?? 1448} loading="lazy" decoding="async" /><div><small>{item.id} · {item.brand}</small><h3>{item.title}</h3><button onClick={() => toggleBuiltInWork(item.id)}>{hidden ? "恢复显示" : "隐藏"}</button></div></article>; })}</div>
          </div>
        )}
      </section>
    </main>
  );
}
