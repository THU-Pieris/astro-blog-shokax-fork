export interface FriendLinkData {
  url: string;
  title: string;
  desc?: string;
  author?: string;
  avatar?: string;
  color?: string;
  siteImage?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string, index: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`friends[${index}].${field} 必须是非空字符串`);
  }

  return value.trim();
}

function optionalString(value: unknown, field: string, index: number): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new TypeError(`friends[${index}].${field} 必须是字符串`);
  }

  return value.trim() || undefined;
}

export function parseFriendLinks(value: unknown): FriendLinkData[] {
  if (!Array.isArray(value)) {
    throw new TypeError("friends.json 顶层必须是数组");
  }

  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new TypeError(`friends[${index}] 必须是对象`);
    }

    const url = requiredString(entry.url, "url", index);
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new TypeError(`friends[${index}].url 只允许 HTTP(S) 链接`);
    }

    const link: FriendLinkData = {
      url,
      title: requiredString(entry.title, "title", index),
    };

    const optionalFields = ["desc", "author", "avatar", "color", "siteImage"] as const;

    for (const field of optionalFields) {
      const parsed = optionalString(entry[field], field, index);
      if (parsed !== undefined) {
        link[field] = parsed;
      }
    }

    return link;
  });
}
