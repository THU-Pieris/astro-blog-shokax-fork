import { describe, expect, test } from "vitest";
import { markdownToHtml } from "satteri";
import spanDirective from "./span-directive";

async function render(source: string): Promise<string> {
  const result = await markdownToHtml(source, {
    features: { directive: true },
    mdastPlugins: [spanDirective()],
  });
  return result.html;
}

describe("spanDirective", () => {
  test("renders inline content and preserves language attributes", async () => {
    expect(await render("中文和 :span[日本語]{lang=ja} 混排")).toBe(
      '<p>中文和 <span lang="ja">日本語</span> 混排</p>\n',
    );
  });

  test("preserves existing classes and ordinary attributes", async () => {
    expect(await render(':span[sample]{.accent lang=en title="English sample"}')).toBe(
      '<p><span lang="en" title="English sample" class="accent">sample</span></p>\n',
    );
  });
});
