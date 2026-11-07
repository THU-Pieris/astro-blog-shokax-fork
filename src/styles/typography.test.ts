import { describe, expect, it } from "vitest";
import { access, readFile } from "node:fs/promises";

const typographyPath = new URL("./typography.css", import.meta.url);
const layoutPath = new URL("../layouts/Layout.astro", import.meta.url);
const brandPath = new URL("../components/Brand.astro", import.meta.url);
const themeConfigPath = new URL("../theme.config.ts", import.meta.url);
const searchPagePath = new URL("./search-page.css", import.meta.url);
const hyacineConfigPath = new URL("../../hyacine.yml", import.meta.url);
const legacyFontPath = new URL("../assets/fonts/LXGWWenKai-Regular.ttf", import.meta.url);

describe("正文系统字体", () => {
  it("为中日文提供跨平台无衬线字体和最终兜底", async () => {
    const css = await readFile(typographyPath, "utf8");

    expect(css).toContain('"PingFang SC"');
    expect(css).toContain('"Microsoft YaHei UI"');
    expect(css).toContain("Roboto");
    expect(css).toContain('"Noto Sans CJK SC"');
    expect(css).toContain('"Hiragino Sans"');
    expect(css).toContain('"Yu Gothic UI"');
    expect(css).toContain('"Noto Sans CJK JP"');
    expect(css).toMatch(/--font-sans-zh:[\s\S]*sans-serif;/);
    expect(css).toMatch(/--font-sans-ja:[\s\S]*sans-serif;/);
    expect(css).toContain(':where([lang|="ja"])');
    expect(css).toContain(':where(html[lang|="ja"]) body');
    expect(css).toMatch(/body\s*{[\s\S]*?--pf-font: var\(--font-sans-zh\);[\s\S]*?}/);
  });

  it("不再动态加载或切换霞鹜文楷", async () => {
    const [css, layout, searchPage, hyacineConfig] = await Promise.all([
      readFile(typographyPath, "utf8"),
      readFile(layoutPath, "utf8"),
      readFile(searchPagePath, "utf8"),
      readFile(hyacineConfigPath, "utf8"),
    ]);
    const source = `${css}\n${layout}\n${hyacineConfig}`;

    expect(source).not.toContain("LXGWWenKai");
    expect(source).not.toContain("document.body.style.fontFamily");
    expect(layout).toContain('import "@/styles/typography.css";');
    expect(searchPage).toContain("--pf-font: var(--font-sans-zh);");
    let legacyFontExists = true;
    try {
      await access(legacyFontPath);
    } catch {
      legacyFontExists = false;
    }
    expect(legacyFontExists).toBe(false);
  });

  it("为首页日文站点标题声明语言", async () => {
    const [brand, layout, themeConfig] = await Promise.all([
      readFile(brandPath, "utf8"),
      readFile(layoutPath, "utf8"),
      readFile(themeConfigPath, "utf8"),
    ]);

    expect(themeConfig).toContain('titleLang: "ja"');
    expect(layout).toContain("titleLang={brandConfig.titleLang}");
    expect(brand).toContain("lang={pageTitle ? pageTitleLang : titleLang}");
  });
});
