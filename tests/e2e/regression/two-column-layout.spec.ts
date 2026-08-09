import { expect, test } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { openSearchDialog } from "../support/search";

test("@regression 超宽屏首页保持双栏布局且不渲染右侧栏", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(ROUTES.home);

  await expect(page.locator("body")).toHaveAttribute("data-layout-mode", "two-column");

  const leftSidebar = page.locator(".layout-two-column > .layout-sidebar-column");
  const mainColumn = page.locator(".layout-two-column > #main");

  await expect(leftSidebar).toBeVisible();
  await expect(mainColumn).toBeVisible();
  await expect(page.locator(".layout-two-column > .layout-extra-column")).toHaveCount(0);

  const positions = await page.evaluate(() => {
    const left = document
      .querySelector(".layout-two-column > .layout-sidebar-column")
      ?.getBoundingClientRect();
    const main = document.querySelector(".layout-two-column > #main")?.getBoundingClientRect();

    return {
      leftX: left?.left ?? -1,
      mainX: main?.left ?? -1,
    };
  });

  expect(positions.leftX).toBeGreaterThanOrEqual(0);
  expect(positions.leftX).toBeLessThan(positions.mainX);
});

test("@regression 双栏布局的全局搜索入口在超宽屏可用", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 620 });
  await page.goto(ROUTES.home);

  await expect(page.locator("body")).toHaveAttribute("data-layout-mode", "two-column");
  await expect(page.locator(".layout-extra-column")).toHaveCount(0);

  const searchDialog = await openSearchDialog(page);
  await expect(searchDialog).toBeVisible();
});
