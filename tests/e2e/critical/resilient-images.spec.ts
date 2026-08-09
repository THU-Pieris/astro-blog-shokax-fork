import { expect, test } from "@playwright/test";

test("@critical 随机图片失效时应切换到本地封面", async ({ page }) => {
  const randomImageRequests: string[] = [];
  await page.route("https://pic.pieris05.com/**", async (route) => {
    randomImageRequests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "upstream image service unavailable",
    });
  });

  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  const headerImage = page.locator("#imgs shokax-resilient-image").first();
  await expect(headerImage).toHaveAttribute("data-recovery-state", "fallback");
  await expect
    .poll(() =>
      headerImage.locator("img").evaluate((image) => {
        return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
      }),
    )
    .toBeTruthy();

  const headerLayout = await headerImage.locator("img").evaluate((image) => {
    const style = window.getComputedStyle(image);
    const imageRect = image.getBoundingClientRect();
    const headerRect = document.querySelector("#imgs")?.getBoundingClientRect();
    return {
      fillsHeader:
        headerRect !== undefined &&
        Math.abs(imageRect.width - headerRect.width) < 1 &&
        Math.abs(imageRect.height - headerRect.height) < 1,
      objectFit: style.objectFit,
      position: style.position,
    };
  });
  expect(headerLayout).toEqual({
    fillsHeader: true,
    objectFit: "cover",
    position: "absolute",
  });

  const fallbackSrc = await headerImage.locator("img").getAttribute("src");
  await page.waitForTimeout(800);
  await expect(headerImage).toHaveAttribute("data-recovery-state", "fallback");
  await expect(headerImage.locator("img")).toHaveAttribute("src", fallbackSrc!);

  const headerRequests = randomImageRequests.filter((requestUrl) => {
    return !new URL(requestUrl).searchParams.has("post");
  });
  expect(headerRequests).toHaveLength(3);

  const postImage = page.locator(".segment-item .cover shokax-resilient-image").first();
  await postImage.scrollIntoViewIfNeeded();
  await expect(postImage).toHaveAttribute("data-recovery-state", "fallback");

  const postLayout = await postImage.locator("img").evaluate((image) => {
    const style = window.getComputedStyle(image);
    const imageRect = image.getBoundingClientRect();
    const coverRect = image.closest(".cover")?.getBoundingClientRect();
    return {
      fillsCover:
        coverRect !== undefined &&
        Math.abs(imageRect.width - coverRect.width) < 1 &&
        Math.abs(imageRect.height - coverRect.height) < 1,
      objectFit: style.objectFit,
      contentVisibility: style.contentVisibility,
    };
  });
  expect(postLayout).toEqual({
    fillsCover: true,
    objectFit: "cover",
    contentVisibility: "auto",
  });
});

test("@critical 首屏样式表应阻塞加载以避免冷启动半样式页面", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  const stylesheets = await page.locator('link[rel="stylesheet"][href]').evaluateAll((links) => {
    return links.map((link) => ({
      loaded: link instanceof HTMLLinkElement && link.sheet !== null,
      media: link.getAttribute("media"),
      onload: link.getAttribute("onload"),
    }));
  });

  expect(stylesheets.length).toBeGreaterThan(0);
  expect(stylesheets).toEqual(stylesheets.map(() => ({ loaded: true, media: null, onload: null })));
});
