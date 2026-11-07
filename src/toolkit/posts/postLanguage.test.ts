import { describe, expect, test } from "vitest";
import {
  DEFAULT_POST_LANGUAGE,
  POST_LANGUAGES,
  isPostLanguage,
  parsePostLanguage,
  resolveDescriptionLanguage,
} from "./postLanguage";

describe("postLanguage", () => {
  test("exposes the supported article languages and Chinese default", () => {
    expect(POST_LANGUAGES).toEqual(["zh-CN", "ja", "en"]);
    expect(DEFAULT_POST_LANGUAGE).toBe("zh-CN");
  });

  test("recognizes only supported language codes", () => {
    expect(isPostLanguage("zh-CN")).toBe(true);
    expect(isPostLanguage("ja")).toBe(true);
    expect(isPostLanguage("en")).toBe(true);
    expect(isPostLanguage("zh-TW")).toBe(false);
    expect(isPostLanguage(undefined)).toBe(false);
  });

  test("rejects unsupported language codes with a useful error", () => {
    expect(parsePostLanguage("ja")).toBe("ja");
    expect(() => parsePostLanguage("fr")).toThrow("zh-CN、ja、en");
  });

  test("uses the description language, then the post language, then page inheritance", () => {
    expect(resolveDescriptionLanguage("zh-CN", "ja")).toBe("ja");
    expect(resolveDescriptionLanguage("en")).toBe("en");
    expect(resolveDescriptionLanguage()).toBeUndefined();
  });
});
