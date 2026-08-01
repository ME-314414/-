# 孟宪一｜AI Visual Designer Portfolio

基于 React、Vite、GSAP 与 WebGL 的静态个人作品集网站。

## 本地预览

```bash
npm install
npm run dev
```

默认访问地址：`http://localhost:3000/`

作品编辑入口：`http://localhost:3000/studio`

## 构建

```bash
npm run build
```

构建结果位于 `dist/`，其中包含可直接部署的 `index.html`、图片、视频、样式和脚本文件。

## Cloudflare Pages 设置

- 生产分支：`master`
- 框架预设：`React (Vite)`
- 构建命令：`npm run build`
- 构建输出目录：`dist`
- 根目录：留空

`public/_redirects` 会在部署时复制到 `dist/`，用于支持直接访问 `/studio`。
