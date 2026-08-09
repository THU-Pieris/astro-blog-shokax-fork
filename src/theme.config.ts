// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "アセビ。",
  locale: "zh-CN",

  nav: [
    {
      href: "/",
      text: "首页",
      icon: "i-ri-home-line",
    },
    {
      href: "/random/",
      text: "文章",
      icon: "i-ri-quill-pen-line",
      dropbox: {
        enable: true,
        items: [
          {
            href: "/categories/",
            text: "分类",
            icon: "i-ri-book-shelf-line",
          },
          {
            href: "/tags/",
            text: "标签",
            icon: "i-ri-price-tag-3-line",
          },
          {
            href: "/archives/",
            text: "归档",
            icon: "i-ri-archive-line",
          },
        ],
      },
    },
    {
      href: "/subscribe/",
      text: "订阅",
      icon: "i-ri-rss-line",
    },
    {
      href: "/friends/",
      text: "友链",
      icon: "i-ri-heart-3-line",
    },
    {
      href: "/about/",
      text: "关于",
      icon: "i-ri-user-3-line",
    },
  ],

  brand: {
    title: "アセビ。",
    subtitle: "迁移自Wordpress，再也不弄动态博客了QAQ",
    logo: "",
  },

  cover: {
    enable: true,
    preload: false,
    fixedCover: {
      enable: true,
      url: "https://pic.pieris05.com/api",
    },
    postFallbackCover: "https://pic.pieris05.com/api",
    advancedCarousel: false,
    coverUrls: [],
    gradient: false,
    nextGradientCover: false,
  },

  sidebar: {
    author: "Pieris",
    description: "V厨",
    social: {
      github: {
        url: "https://github.com/THU-Pieris",
        icon: "i-ri-github-fill",
        color: "#000000",
      },
      bilibili: {
        url: "https://space.bilibili.com/110219537",
        icon: "i-ri-bilibili-fill",
        color: "#00aeec",
      },
      homepage: {
        url: "https://pieris05.com",
        icon: "i-ri-home-heart-line",
        color: "#000000",
      },
    },
  },

  footer: {
    since: 2020,
    icon: {
      name: "sakura rotate",
      color: "#ffc0cb",
    },
    count: true,
    powered: true,
    icp: {
      enable: false,
    },
  },

  widgets: {
    randomPosts: false,
    recentComments: false,
    recentCommentsLimit: 0,
  },

  comments: {
    enable: false,
    waline: {
      serverURL: "",
      lang: "zh-CN",
    },
  },

  nyxPlayer: {
    enable: false,
    urls: [],
  },

  home: {
    selectedCategories: [
      {
        name: "ACG杂谈",
        cover: "/assets/private/categories/acg.jpg",
      },
      {
        name: "Miku",
        cover: "/assets/private/categories/miku.jpg",
      },
      {
        name: "读书笔记",
        cover: "/assets/private/categories/notes.jpg",
      },
      {
        name: "随感",
        cover: "/assets/private/categories/thoughts.jpg",
      },
    ],
    pageSize: 10,
    title: {
      behavior: "default",
    },
  },

  layout: {
    mode: "two-column",
    rightSidebar: {
      announcement: false,
      search: false,
      calendar: false,
      recentMoments: false,
      randomPosts: false,
      tagCloud: false,
    },
  },

  friends: {
    title: "友链",
    description: "Pieris 的朋友与常用链接。",
    comments: false,
    avatar: "/assets/private/avatar.webp",
    color: "#58b2dc",
    links: [],
  },

  tagCloud: {
    startColor: "#72cecf",
    endColor: "#ffbac3",
  },

  visibilityTitle: {
    enable: false,
  },

  hyc: {
    enable: false,
  },

  copyright: {
    license: "CC-BY-NC-SA-4.0",
    show: true,
  },
});
