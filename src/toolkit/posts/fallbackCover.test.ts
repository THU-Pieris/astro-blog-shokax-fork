import { describe, expect, test } from "vitest";
import { buildPostFallbackCoverUrl } from "./fallbackCover";

describe("buildPostFallbackCoverUrl", () => {
  test("adds a post-specific cache key", () => {
    expect(buildPostFallbackCoverUrl("https://pic.example.com/api", "49fa32a4b2e6")).toBe(
      "https://pic.example.com/api?post=49fa32a4b2e6",
    );
  });

  test("preserves existing query parameters", () => {
    expect(
      buildPostFallbackCoverUrl("https://pic.example.com/api?size=large", "09d09998641f"),
    ).toBe("https://pic.example.com/api?size=large&post=09d09998641f");
  });

  test("rejects missing or unsafe values", () => {
    expect(buildPostFallbackCoverUrl(undefined, "49fa32a4b2e6")).toBeUndefined();
    expect(buildPostFallbackCoverUrl("https://pic.example.com/api", "")).toBeUndefined();
    expect(buildPostFallbackCoverUrl("/api", "49fa32a4b2e6")).toBeUndefined();
    expect(buildPostFallbackCoverUrl("javascript:alert(1)", "49fa32a4b2e6")).toBeUndefined();
  });
});
