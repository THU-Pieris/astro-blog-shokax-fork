import { defineConfig } from "@hyacine/plugin-core";
import mouseFirework from "@hyacine/plugin-mouse-firework";
import articleStatistics from "@hyacine/plugin-article-statistics";

// 本 fork 只启用鼠标烟花与文章统计；评论、播放器、统计分析、AI、
// 运行时间、标题切换、文章过期提示、访问计数均不启用。
export default defineConfig({
  injectPoints: {
    "footer-status": {
      selector: "#footer .status",
      position: "append",
    },
    "post-header": {
      selector: "article.post header",
      position: "after",
    },
    "post-footer": {
      selector: "article.post .body",
      position: "after",
    },
  },
  plugins: [
    mouseFirework({
      colors: [
        "rgba(255,182,185,.9)",
        "rgba(250,227,217,.9)",
        "rgba(187,222,214,.9)",
        "rgba(138,198,209,.9)",
      ],
      count: 30,
      radius: 16,
    }),
    articleStatistics(),
  ],
});
