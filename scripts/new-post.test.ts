import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  POST_ID_PATTERN,
  createPost,
  createPostContent,
  formatLocalDate,
  generatePostId,
  normalizeTitle,
  parseArguments,
  resolvePostsDirectory,
} from "./new-post";

const temporaryDirectories: string[] = [];

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "shokax-new-post-"));
  temporaryDirectories.push(directory);
  return directory;
}

async function expectRejectionMessage(
  promise: Promise<unknown>,
  expectedMessage: string,
): Promise<void> {
  let actualMessage = "";
  try {
    await promise;
  } catch (error) {
    actualMessage = error instanceof Error ? error.message : String(error);
  }
  expect(actualMessage).toContain(expectedMessage);
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, {
        recursive: true,
        force: true,
      }),
    ),
  );
});

describe("new post generator", () => {
  test("accepts and safely quotes a Chinese title", () => {
    const content = createPostContent('  中文“标题”与 "引号"  ', new Date(2026, 7, 9));

    expect(content).toContain('title: "中文“标题”与 \\"引号\\""');
    expect(content).toContain("lang: zh-CN");
    expect(content).toContain("date: 2026-08-09");
    expect(content).toContain("draft: true");
  });

  test("rejects empty and multiline titles", () => {
    expect(() => normalizeTitle("   ")).toThrow("文章标题不能为空");
    expect(() => normalizeTitle("第一行\n第二行")).toThrow("控制字符");
  });

  test("generates 12-character lowercase hexadecimal IDs", () => {
    const ids = new Set<string>();
    for (let index = 0; index < 100; index += 1) {
      const postId = generatePostId();
      expect(postId).toMatch(POST_ID_PATTERN);
      ids.add(postId);
    }
    expect(ids.size).toBe(100);
  });

  test("formats dates using local calendar fields", () => {
    expect(formatLocalDate(new Date(2026, 0, 2, 23, 59))).toBe("2026-01-02");
  });

  test("parses quoted or unquoted title words and an output directory", () => {
    expect(parseArguments(["中文", "标题", "--posts-dir", "../content/posts"])).toEqual({
      title: "中文 标题",
      postsDirectory: "../content/posts",
      lang: "zh-CN",
    });
  });

  test("accepts supported language options in both CLI forms", () => {
    expect(parseArguments(["日本語の記事", "--lang", "ja"])).toEqual({
      title: "日本語の記事",
      postsDirectory: undefined,
      lang: "ja",
    });
    expect(parseArguments(["English post", "--lang=en"])).toEqual({
      title: "English post",
      postsDirectory: undefined,
      lang: "en",
    });
  });

  test("rejects missing, unsupported, and duplicate language options", () => {
    expect(() => parseArguments(["标题", "--lang"])).toThrow("--lang 后必须提供语言代码");
    expect(() => parseArguments(["标题", "--lang=fr"])).toThrow("zh-CN、ja、en");
    expect(() => parseArguments(["标题", "--lang=ja", "--lang=en"])).toThrow("--lang 不能重复指定");
  });

  test("prefers an explicit directory over the environment", () => {
    expect(resolvePostsDirectory("C:\\site", "../explicit", "../environment")).toBe(
      resolve("C:\\site", "../explicit"),
    );
  });

  test("detects the sibling private content repository", async () => {
    const root = await createTemporaryDirectory();
    const publicRepository = join(root, "astro-blog-shokax-fork");
    const privateRepository = join(root, "astro-blog-content");
    await mkdir(publicRepository, { recursive: true });
    await mkdir(join(privateRepository, ".git"), { recursive: true });

    expect(resolvePostsDirectory(publicRepository, undefined, "")).toBe(
      join(privateRepository, "site", "src", "posts"),
    );
  });

  test("writes an atomic draft with a deterministic ID", async () => {
    const postsDirectory = await createTemporaryDirectory();
    const postPath = await createPost({
      title: "迁移后的第一篇文章",
      postsDirectory,
      date: new Date(2026, 7, 9),
      postId: "0123abcdef45",
    });

    expect(postPath).toBe(join(postsDirectory, "0123abcdef45.md"));
    expect(await readFile(postPath, "utf8")).toContain('title: "迁移后的第一篇文章"');
  });

  test("writes the selected language into frontmatter", async () => {
    const postsDirectory = await createTemporaryDirectory();
    const postPath = await createPost({
      title: "日本語の記事",
      postsDirectory,
      date: new Date(2026, 7, 9),
      postId: "abcdef012345",
      lang: "ja",
    });

    expect(await readFile(postPath, "utf8")).toContain("lang: ja");
  });

  test("rejects IDs that are not 12-character lowercase hexadecimal strings", async () => {
    const postsDirectory = await createTemporaryDirectory();
    await expectRejectionMessage(
      createPost({ title: "无效 ID", postsDirectory, postId: "ABCDEF123456" }),
      "12 位小写十六进制",
    );
  });

  test("rejects Markdown and MDX collisions without overwriting", async () => {
    const postsDirectory = await createTemporaryDirectory();
    const markdownId = "aaaaaaaaaaaa";
    const mdxId = "bbbbbbbbbbbb";
    const existingMarkdown = join(postsDirectory, `${markdownId}.md`);
    await writeFile(existingMarkdown, "keep me", "utf8");
    await writeFile(join(postsDirectory, `${mdxId}.mdx`), "keep me too", "utf8");

    await expectRejectionMessage(
      createPost({ title: "冲突", postsDirectory, postId: markdownId }),
      "文章 ID 冲突",
    );
    await expectRejectionMessage(
      createPost({ title: "冲突", postsDirectory, postId: mdxId }),
      "文章 ID 冲突",
    );
    expect(await readFile(existingMarkdown, "utf8")).toBe("keep me");
  });
});
