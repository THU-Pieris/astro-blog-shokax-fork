import { describe, expect, test } from "bun:test";
import { buildRetryImageUrl } from "./retryImage";

describe("buildRetryImageUrl", () => {
  test("adds a cache-busting retry marker without dropping existing parameters", () => {
    expect(
      buildRetryImageUrl(
        "https://pic.example.com/api?post=49fa32a4b2e6",
        "https://blog.example.com/",
        2,
        "1234",
      ),
    ).toBe("https://pic.example.com/api?post=49fa32a4b2e6&_shokax_retry=2-1234");
  });

  test("replaces an earlier retry marker", () => {
    expect(
      buildRetryImageUrl(
        "https://pic.example.com/api?_shokax_retry=1-old",
        "https://blog.example.com/",
        2,
        "new",
      ),
    ).toBe("https://pic.example.com/api?_shokax_retry=2-new");
  });

  test("resolves site-relative image URLs", () => {
    expect(
      buildRetryImageUrl("/_astro/fallback.avif", "https://blog.example.com/posts/1/", 1, "x"),
    ).toBe("https://blog.example.com/_astro/fallback.avif?_shokax_retry=1-x");
  });

  test("leaves malformed and unsafe URLs unchanged", () => {
    expect(buildRetryImageUrl("javascript:alert(1)", "https://blog.example.com/", 1, "x")).toBe(
      "javascript:alert(1)",
    );
    expect(buildRetryImageUrl("https://[", "https://blog.example.com/", 1, "x")).toBe("https://[");
  });
});
