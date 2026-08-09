import { describe, expect, it } from "bun:test";
import { createWidgetPosts } from "./createWidgetPosts";

describe("createWidgetPosts", () => {
  it("should strip sensitive fields before sending widget props", () => {
    const result = createWidgetPosts([
      {
        id: "encrypted-test",
        body: "this should never be exposed",
        data: {
          title: "Encrypted Post",
          encrypted: true,
          password: "test123",
        },
      },
    ]);

    expect(result).toEqual([
      {
        id: "encrypted-test",
        data: {
          title: "Encrypted Post",
          lang: undefined,
          description: "",
          descriptionLang: undefined,
        },
      },
    ]);
    expect("body" in result[0]).toBe(false);
    expect("password" in result[0].data).toBe(false);
  });

  it("should use body excerpt for non-encrypted posts when description is missing", () => {
    const body = "x".repeat(400);

    const result = createWidgetPosts([
      {
        id: "plain-post",
        body,
        data: {
          title: "Plain Post",
          encrypted: false,
        },
      },
    ]);

    expect(result[0].data.description).toBe("x".repeat(300));
  });

  it("should not derive description from body for encrypted posts", () => {
    const result = createWidgetPosts([
      {
        id: "enc-no-desc",
        body: "top-secret-body",
        data: {
          title: "Encrypted No Desc",
          encrypted: true,
        },
      },
    ]);

    expect(result[0].data.description).toBe("");
    expect(result[0].data.description).not.toContain("top-secret-body");
  });

  it("should keep unicode character boundaries in body excerpt", () => {
    const result = createWidgetPosts(
      [
        {
          id: "unicode-post",
          body: "😀你好世界",
          data: {
            title: "Unicode Post",
            encrypted: false,
          },
        },
      ],
      1,
    );

    expect(result[0].data.description).toBe("😀");
  });

  it("propagates title and description languages", () => {
    const result = createWidgetPosts([
      {
        id: "language-post",
        body: "fallback",
        data: {
          title: "Japanese title",
          lang: "ja",
          description: "English summary",
          descriptionLang: "en",
        },
      },
    ]);

    expect(result[0].data.lang).toBe("ja");
    expect(result[0].data.descriptionLang).toBe("en");
  });

  it("uses post language for a body-derived description", () => {
    const result = createWidgetPosts([
      {
        id: "body-language-post",
        body: "English body",
        data: { title: "English", lang: "en" },
      },
    ]);

    expect(result[0].data.descriptionLang).toBe("en");
  });
});
