import { DEFAULT_EXCERPT_LENGTH, resolveExcerpt, type ExcerptSourceLike } from "./excerpt";
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

export interface WidgetPostSource extends ExcerptSourceLike {
  id: string;
  data: {
    title: string;
    lang?: PostLanguage;
    description?: string;
    descriptionLang?: PostLanguage;
    encrypted?: boolean;
    password?: string;
  };
}

export function createWidgetPosts(
  posts: WidgetPostSource[],
  excerptLength: number = DEFAULT_EXCERPT_LENGTH,
): WidgetPost[] {
  return posts.map((post) => {
    // 只有显式 description 才使用 descriptionLang；正文截断摘要沿用文章语言
    const hasExplicitDescription = Boolean(post.data.description?.trim());

    return {
      id: post.id,
      data: {
        title: post.data.title,
        lang: post.data.lang,
        description: resolveExcerpt(post, { length: excerptLength }),
        descriptionLang: hasExplicitDescription
          ? resolveDescriptionLanguage(post.data.lang, post.data.descriptionLang)
          : post.data.lang,
      },
    };
  });
}
