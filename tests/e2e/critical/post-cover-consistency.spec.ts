import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test.beforeEach(async ({ page }) => {
  await page.route("https://pic.pieris05.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" />',
    });
  });
});

function extractUrlFromBackgroundImage(style: string | null): string | null {
  if (!style) {
    return null;
  }

  const matched = /url\((?:"|')?(.*?)(?:"|')?\)/.exec(style);
  return matched?.[1] ?? null;
}

test("@critical 文章内页头图应优先使用当前文章 cover", async ({ page }) => {
  const response = await page.goto(POSTS.helloWorld);
  expect(response?.ok()).toBeTruthy();

  const headerCover = page.locator("#imgs .single-image");
  await expect(headerCover).toBeVisible();

  const headerCoverSrc = await headerCover.evaluate((element) => {
    if (element instanceof HTMLImageElement) {
      return element.currentSrc || element.src;
    }

    const style = window.getComputedStyle(element);
    return style.backgroundImage;
  });

  const headerCoverUrl = headerCoverSrc.startsWith("url(")
    ? extractUrlFromBackgroundImage(headerCoverSrc)
    : headerCoverSrc;

  expect(headerCoverUrl).not.toBeNull();
  expect(headerCoverUrl).toContain("cover-1");
});

test("@critical 文章内页下一页封面应与目标文章 cover 一致", async ({ page }) => {
  const response = await page.goto(POSTS.helloWorld);
  expect(response?.ok()).toBeTruthy();

  const nextLink = page.locator(`.post-nav a[rel="next"][href="${POSTS.gettingStarted}"]`);
  await expect(nextLink).toBeVisible();

  const nextBackgroundImage = await nextLink.evaluate((element) => {
    return window.getComputedStyle(element).backgroundImage;
  });

  const nextCoverUrl = extractUrlFromBackgroundImage(nextBackgroundImage);

  expect(nextCoverUrl).not.toBeNull();
  expect(nextCoverUrl).toContain("cover-2");
});

test("@critical 文章内页上一篇未设置 cover 时应使用随机图片 API", async ({ page }) => {
  const response = await page.goto(POSTS.helloWorld);
  expect(response?.ok()).toBeTruthy();

  const prevLink = page.locator(`.post-nav a[rel="prev"][href="${POSTS.stickyExample}"]`);
  await expect(prevLink).toBeVisible();

  const prevBackgroundImage = await prevLink.evaluate((element) => {
    return window.getComputedStyle(element).backgroundImage;
  });

  const prevCoverUrl = extractUrlFromBackgroundImage(prevBackgroundImage);
  expect(prevCoverUrl).not.toBeNull();

  const parsedCoverUrl = new URL(prevCoverUrl!);
  expect(parsedCoverUrl.origin + parsedCoverUrl.pathname).toBe("https://pic.pieris05.com/api");
  expect(parsedCoverUrl.searchParams.get("post")).toBe("sticky-example");
});
