export const POST_LANGUAGES = ["zh-CN", "ja", "en"] as const;

export const DEFAULT_POST_LANGUAGE = "zh-CN" as const;

export type PostLanguage = (typeof POST_LANGUAGES)[number];

const POST_LANGUAGE_SET = new Set<string>(POST_LANGUAGES);

export function isPostLanguage(value: unknown): value is PostLanguage {
  return typeof value === "string" && POST_LANGUAGE_SET.has(value);
}

export function parsePostLanguage(value: unknown): PostLanguage {
  if (isPostLanguage(value)) {
    return value;
  }

  throw new Error(`文章语言仅支持：${POST_LANGUAGES.join("、")}`);
}

export function resolveDescriptionLanguage(
  postLanguage?: PostLanguage,
  descriptionLanguage?: PostLanguage,
): PostLanguage | undefined {
  return descriptionLanguage ?? postLanguage;
}
