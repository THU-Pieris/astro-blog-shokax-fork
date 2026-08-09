import { expect, type Page } from "@playwright/test";

export async function waitForAstroIslandHydration(page: Page, componentName: string) {
  const island = page.locator(`astro-island[component-url*="/${componentName}."]`).first();

  await expect(island).toHaveCount(1);
  await expect
    .poll(async () => island.getAttribute("ssr"), {
      message: `Wait for ${componentName} to hydrate`,
    })
    .toBeNull();

  return island;
}
