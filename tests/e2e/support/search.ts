import { expect, type Page } from "@playwright/test";
import { waitForAstroIslandHydration } from "./hydration";

/**
 * 打开搜索面板，兼容 client:idle 水合延迟。
 */
export async function openSearchDialog(page: Page) {
  const openSearchButton = page.locator("#search");
  const searchDialog = page.getByRole("dialog", { name: "Search" });

  await expect(openSearchButton).toBeVisible();
  await waitForAstroIslandHydration(page, "SearchPage");

  if (!(await searchDialog.isVisible())) {
    await openSearchButton.click();
  }

  await expect(searchDialog).toBeVisible();
  return searchDialog;
}
