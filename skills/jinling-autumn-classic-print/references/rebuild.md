# 重建示例

## 依赖

- Node.js 20 或更新版本。
- sharp 0.35.5；在技能根目录执行 `npm install`。`private:true` 仅禁止误发 npm，不代表 GitHub 仓库必须私有。
- 系统字体 Noto Serif SC、Noto Sans SC。可从 [Noto Serif SC](https://fonts.google.com/noto/specimen/Noto+Serif+SC) 与 [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) 获取。字体文件不打包，按字体自身授权使用。系统缺字体会导致回退与排版差异，导出前必须安装。

## 命令

在技能根目录：

```sh
npm install
npm run verify
npm run build
node scripts/export.cjs --only 00_系列封面
```

默认从 `assets/designs` 读取每张图的 layout.svg 和 elements，导出到 `assets/final-designs`。`--output <目录>` 可将测试结果写到另一个目录而不覆盖示例。程序不调用图像生成 API，不需要密钥。

修改以 layout.svg 为准；design.json 保存文字及素材索引，需要同步维护。每个 PNG 在本图 elements 文件夹内，布局只用相对路径；最终 SVG 嵌入所有图片。PNG 以6144×4096直接渲染、全彩、无损，不使用调色板压缩。PNG compressionLevel=9 是压缩率，不是有损画质等级。

`npm run verify` 检查8份SVG与8张PNG、尺寸、素材和哈希、SVG与源稿一致性、真实文本及图层、无旧文案、无失效图片。字体版本与渲染器可能造成跨平台像素差异，视觉检查仍必需。

从仓库根目录运行 `node scripts/audit.cjs --write-checksums` 更新清单，然后 `node scripts/audit.cjs` 检查清单、相对链接、私有路径和单文件体积。不要在修改文件后继续沿用旧校验值。
