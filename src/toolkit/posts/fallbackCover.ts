const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * 为随机图片 API 添加文章级缓存键。
 *
 * 该参数只用于让不同文章产生不同请求 URL；图片是否稳定仍由 API 自身决定。
 */
export function buildPostFallbackCoverUrl(
  baseUrl: string | undefined,
  postId: string | undefined,
): string | undefined {
  const normalizedBaseUrl = baseUrl?.trim();
  const normalizedPostId = postId?.trim();

  if (!normalizedBaseUrl || !normalizedPostId) {
    return undefined;
  }

  try {
    const url = new URL(normalizedBaseUrl);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return undefined;
    }

    url.searchParams.set("post", normalizedPostId);
    return url.toString();
  } catch {
    return undefined;
  }
}
