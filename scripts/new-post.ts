import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import {
  DEFAULT_POST_LANGUAGE,
  parsePostLanguage,
  type PostLanguage,
} from "../src/toolkit/posts/postLanguage";

export const POST_ID_PATTERN = /^[0-9a-f]{12}$/;

const PRIVATE_CONTENT_REPOSITORY = "astro-blog-content";
const PRIVATE_POSTS_PATH = join("site", "src", "posts");

export interface CreatePostOptions {
  title: string;
  postsDirectory: string;
  date?: Date;
  postId?: string;
  lang?: PostLanguage;
}

export interface ParsedArguments {
  title: string;
  postsDirectory?: string;
  lang: PostLanguage;
}

export function normalizeTitle(input: string): string {
  const title = input.trim();

  if (title.length === 0) {
    throw new Error("文章标题不能为空");
  }

  for (const character of title) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint <= 31 || codePoint === 127) {
      throw new Error("文章标题不能包含换行符或控制字符");
    }
  }

  return title;
}

export function generatePostId(): string {
  return randomBytes(6).toString("hex");
}

export function formatLocalDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("无法生成文章日期");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createPostContent(
  titleInput: string,
  date: Date,
  lang: PostLanguage = DEFAULT_POST_LANGUAGE,
): string {
  const title = normalizeTitle(titleInput);
  const yamlTitle = JSON.stringify(title);

  return [
    "---",
    `title: ${yamlTitle}`,
    `lang: ${lang}`,
    `date: ${formatLocalDate(date)}`,
    "tags: []",
    "categories: []",
    "draft: true",
    "---",
    "",
    "",
  ].join("\n");
}

export function parseArguments(args: string[]): ParsedArguments {
  const titleParts: string[] = [];
  let postsDirectory: string | undefined;
  let lang: PostLanguage = DEFAULT_POST_LANGUAGE;
  let hasExplicitLang = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--") {
      continue;
    }

    if (argument === "--posts-dir") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--posts-dir 后必须提供目录");
      }
      postsDirectory = value;
      index += 1;
      continue;
    }

    if (argument.startsWith("--posts-dir=")) {
      postsDirectory = argument.slice("--posts-dir=".length);
      if (postsDirectory.length === 0) {
        throw new Error("--posts-dir 后必须提供目录");
      }
      continue;
    }

    if (argument === "--lang") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--lang 后必须提供语言代码（zh-CN、ja 或 en）");
      }
      if (hasExplicitLang) {
        throw new Error("--lang 不能重复指定");
      }
      lang = parsePostLanguage(value);
      hasExplicitLang = true;
      index += 1;
      continue;
    }

    if (argument.startsWith("--lang=")) {
      if (hasExplicitLang) {
        throw new Error("--lang 不能重复指定");
      }
      lang = parsePostLanguage(argument.slice("--lang=".length));
      hasExplicitLang = true;
      continue;
    }

    if (argument.startsWith("--")) {
      throw new Error(`未知参数：${argument}`);
    }

    titleParts.push(argument);
  }

  return {
    title: normalizeTitle(titleParts.join(" ")),
    postsDirectory,
    lang,
  };
}

function resolveConfiguredDirectory(directory: string, workingDirectory: string): string {
  return isAbsolute(directory) ? directory : resolve(workingDirectory, directory);
}

export function resolvePostsDirectory(
  workingDirectory: string,
  cliDirectory?: string,
  environmentDirectory = process.env.BLOG_POSTS_DIR,
): string {
  if (cliDirectory) {
    return resolveConfiguredDirectory(cliDirectory, workingDirectory);
  }

  if (environmentDirectory) {
    return resolveConfiguredDirectory(environmentDirectory, workingDirectory);
  }

  const privateRepository = resolve(workingDirectory, "..", PRIVATE_CONTENT_REPOSITORY);
  if (existsSync(join(privateRepository, ".git"))) {
    return join(privateRepository, PRIVATE_POSTS_PATH);
  }

  throw new Error(
    "未找到同级私有内容仓库 astro-blog-content；请使用 --posts-dir 或 BLOG_POSTS_DIR 指定文章目录",
  );
}

function isCollisionError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}

export async function createPost(options: CreatePostOptions): Promise<string> {
  const title = normalizeTitle(options.title);
  const postId = options.postId ?? generatePostId();

  if (!POST_ID_PATTERN.test(postId)) {
    throw new Error("文章 ID 必须是 12 位小写十六进制字符串");
  }

  const markdownPath = join(options.postsDirectory, `${postId}.md`);
  const mdxPath = join(options.postsDirectory, `${postId}.mdx`);

  if (existsSync(markdownPath) || existsSync(mdxPath)) {
    throw new Error(`文章 ID 冲突：${postId}`);
  }

  await mkdir(options.postsDirectory, { recursive: true });

  try {
    await writeFile(
      markdownPath,
      createPostContent(title, options.date ?? new Date(), options.lang),
      {
        encoding: "utf8",
        flag: "wx",
      },
    );
  } catch (error) {
    if (isCollisionError(error)) {
      throw new Error(`文章 ID 冲突：${postId}`, { cause: error });
    }
    throw error;
  }

  return markdownPath;
}

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2));
  const postsDirectory = resolvePostsDirectory(process.cwd(), parsed.postsDirectory);
  const postPath = await createPost({
    title: parsed.title,
    postsDirectory,
    lang: parsed.lang,
  });

  console.log(`已创建草稿：${postPath}`);
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`创建文章失败：${message}`);
    process.exitCode = 1;
  });
}
