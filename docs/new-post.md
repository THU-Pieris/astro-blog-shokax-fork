# 新建私有文章

日常写作时，在同级的私有 `astro-blog-content` 仓库根目录运行：

```sh
bun run new "文章标题"
```

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

默认目录布局不适用时，可以只为本次命令指定路径：

```sh
bun run new "文章标题" --posts-dir D:/path/to/private-content/site/src/posts
```

也可以通过 `BLOG_POSTS_DIR` 环境变量设置默认目录。不要把生成的文章复制或提交到
公开主题仓库。
