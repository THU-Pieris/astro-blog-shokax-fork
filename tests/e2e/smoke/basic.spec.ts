import { expect, test } from "@playwright/test";
import { waitForAstroIslandHydration } from "../support/hydration";
import { POSTS, ROUTES } from "../support/routes";
import { openSearchDialog } from "../support/search";

test("@smoke 首页、分页与文章页面可访问", async ({ page }) => {
  const homeResponse = await page.goto(ROUTES.home);
  expect(homeResponse?.ok()).toBeTruthy();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
  await expect(page.getByRole("link", { name: "查看本站源代码" })).toHaveAttribute(
    "href",
    "https://github.com/THU-Pieris/astro-blog-shokax-fork",
  );

  const page2Response = await page.goto(ROUTES.page2);
  expect(page2Response?.ok()).toBeTruthy();
  await expect(page).toHaveURL(ROUTES.page2);

  const postResponse = await page.goto(POSTS.helloWorld);
  expect(postResponse?.ok()).toBeTruthy();
  await expect(page.locator("article.post h1.title")).toHaveText("Hello World!");
});

test("@smoke 搜索面板可打开并通过 Escape 关闭", async ({ page }) => {
  await page.goto(ROUTES.home);

  const searchDialog = await openSearchDialog(page);

  await page.keyboard.press("Escape");
  await expect(searchDialog).not.toBeVisible();
});

test("@smoke 订阅页面可访问", async ({ page }) => {
  const response = await page.goto(ROUTES.subscribe);

  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("article.post h1.title")).toHaveText("订阅");
});

test("@smoke 主题切换与 moments 页面可达", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);
  await waitForAstroIslandHydration(page, "NavBar");

  const initialTheme = await page.evaluate(() => {
    return document.documentElement.dataset.theme;
  });

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .not.toBe(initialTheme);

  await page.goto(ROUTES.moments);
  await expect(page).toHaveURL(ROUTES.moments);
  await expect(page.locator(".moment-card").first()).toBeVisible();
});
