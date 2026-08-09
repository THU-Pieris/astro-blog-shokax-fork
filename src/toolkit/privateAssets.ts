import type { ImageMetadata } from "astro";

// 私有内容仓库装配后优先使用站点头像；公开 fork 单独构建时返回 undefined。
const privateAvatarModules = import.meta.glob<ImageMetadata>("/src/assets/private/avatar.webp", {
  eager: true,
  import: "default",
});

export const privateAvatar = privateAvatarModules["/src/assets/private/avatar.webp"];
