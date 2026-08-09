const RETRY_QUERY_KEY = "_shokax_retry";
const RETRYABLE_PROTOCOLS = new Set(["http:", "https:"]);

export function buildRetryImageUrl(
  source: string,
  baseUrl: string,
  attempt: number,
  nonce: string,
): string {
  try {
    const url = new URL(source, baseUrl);
    if (!RETRYABLE_PROTOCOLS.has(url.protocol)) {
      return source;
    }

    url.searchParams.set(RETRY_QUERY_KEY, `${attempt}-${nonce}`);
    return url.toString();
  } catch {
    return source;
  }
}
