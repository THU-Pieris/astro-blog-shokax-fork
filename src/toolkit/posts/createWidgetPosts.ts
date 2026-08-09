import { resolveDescriptionLanguage, type PostLanguage } from "./postLanguage";

export interface WidgetPost {
  id: string;
  data: {
    title: string;
    lang?: PostLanguage;
    description: string;
    descriptionLang?: PostLanguage;
  };
}

export interface WidgetPostSource {
  id: string;
  body?: string;
  data: {
    title: string;
    lang?: PostLanguage;
    description?: string;
    descriptionLang?: PostLanguage;
    encrypted?: boolean;
    password?: string;
  };
}

const DEFAULT_EXCERPT_LENGTH = 300;

function sliceByCodePoints(input: string, maxChars: number): string {
  if (maxChars <= 0) {
    return "";
  }

  let result = "";
  let count = 0;

  for (const char of input) {
    if (count >= maxChars) {
      break;
    }
    result += char;
    count += 1;
  }

  return result;
}

export function createWidgetPosts(
  posts: WidgetPostSource[],
  excerptLength: number = DEFAULT_EXCERPT_LENGTH,
): WidgetPost[] {
  return posts.map((post) => {
    const explicitDescription = post.data.description?.trim() || "";
    const bodyExcerpt =
      !post.data.encrypted && post.body ? sliceByCodePoints(post.body, excerptLength) : "";

    return {
      id: post.id,
      data: {
        title: post.data.title,
        lang: post.data.lang,
        description: explicitDescription || bodyExcerpt,
        descriptionLang: explicitDescription
          ? resolveDescriptionLanguage(post.data.lang, post.data.descriptionLang)
          : post.data.lang,
      },
    };
  });
}
