import { describe, expect, test } from "vitest";
import { markdownToHtml } from "satteri";
import langDirective from "./lang-directive";

async function render(source: string): Promise<string> {
  const result = await markdownToHtml(source, {
    features: { directive: true },
    mdastPlugins: [langDirective()],
  });
  return result.html;
}

async function expectRenderRejection(source: string, expectedMessage: string): Promise<void> {
  let actualMessage = "";
  try {
    await render(source);
  } catch (error) {
    actualMessage = error instanceof Error ? error.message : String(error);
  }
  expect(actualMessage).toContain(expectedMessage);
}

describe("langDirective", () => {
  test("renders a language container while preserving Markdown", async () => {
    const html = await render(":::lang{code=ja}\n日本語の **文章** です。\n:::");

    expect(html).toBe('<div lang="ja"><p>日本語の <strong>文章</strong> です。</p></div>\n');
  });

  test("accepts every supported article language", async () => {
    expect(await render(":::lang{code=zh-CN}\n中文\n:::")).toContain('<div lang="zh-CN">');
    expect(await render(":::lang{code=en}\nEnglish\n:::")).toContain('<div lang="en">');
  });

  test("rejects missing and unsupported language codes", async () => {
    await expectRenderRejection(":::lang\ntext\n:::", ":::lang 的 code 无效");
    await expectRenderRejection(":::lang{code=fr}\ntext\n:::", "zh-CN、ja、en");
  });

  test("rejects unsupported attributes instead of forwarding them", async () => {
    await expectRenderRejection(":::lang{code=ja title=test}\ntext\n:::", "仅支持 code 属性");
  });
});
