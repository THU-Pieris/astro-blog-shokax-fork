# 新建私有文章

日常写作时，在同级的私有 `astro-blog-content` 仓库根目录运行：

```sh
bun run new "文章标题"
```

新文章默认写入 `lang: zh-CN`。日文或英文文章可以在创建时指定语言：

```sh
bun run new "日本語の記事" --lang ja
bun run new "English post" --lang en
```

`--lang` 只接受 `zh-CN`、`ja` 和 `en`。也可以稍后直接修改文章 frontmatter：

```yaml
---
title: "日本語の記事"
lang: ja
---
```

已有文章不必补写 `lang`；省略时会继承站点的默认语言。整篇文章的 `lang` 会输出到文章的
`<article>` 元素，帮助浏览器选择正确的中日文字形。

如果首页摘要与正文使用不同语言，可以另外设置 `descriptionLang`：

```yaml
description: "An English summary"
lang: ja
descriptionLang: en
```

`descriptionLang` 同样只接受 `zh-CN`、`ja` 和 `en`。省略时摘要使用文章的 `lang`；两者都
省略时继承页面默认语言。

私有仓库中的薄包装器会调用本公开仓库里的 canonical generator，并在
`site/src/posts/` 中创建一篇草稿。例如：

```text
astro-blog-content/site/src/posts/0123abcdef45.md
```

也可以直接在本公开主题仓库运行同一个命令；生成器会自动寻找同级私有仓库，绝不会
默认把新文章写进公开 fork。

文件名是随机生成的 12 位小写十六进制 ID。新文件包含当前本地日期、空标签与分类，
并默认设置 `draft: true`，确认内容后再改为 `false` 发布。生成器不会覆盖同名的
Markdown 或 MDX 文件；遇到极小概率的 ID 冲突时会直接报错，请重新运行命令。

## 混排内容的语言标记

中文文章中的一小段日文可以用现有的行内 `span` 指令：

```md
中文和 :span[日本語の文章]{lang=ja} 混排。
```

需要包含多个段落或 Markdown 格式时，使用块级语言指令：

```md
:::lang{code=ja}
ここに日本語の文章を書く。

**Markdown** 格式仍然有效。
:::
```

块级指令的 `code` 同样只接受 `zh-CN`、`ja` 和 `en`；缺少或写错时构建会直接报错，避免
悄悄使用不正确的字形。

默认目录布局不适用时，可以只为本次命令指定路径：

```sh
bun run new "文章标题" --posts-dir D:/path/to/private-content/site/src/posts
```

也可以通过 `BLOG_POSTS_DIR` 环境变量设置默认目录。不要把生成的文章复制或提交到
公开主题仓库。
