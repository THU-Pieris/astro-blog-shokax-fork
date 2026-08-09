#!/usr/bin/env bash

set -Eeuo pipefail

fail() {
  printf '内容装配失败：%s\n' "$1" >&2
  exit 1
}

if [[ $# -ne 1 ]]; then
  fail "用法：bash scripts/import-private-content.sh <私有内容仓库根目录>"
fi

source_repository="$1"
[[ -d "$source_repository" ]] || fail "找不到私有内容仓库：$source_repository"

source_repository="$(cd -- "$source_repository" && pwd -P)"
[[ -d "$source_repository/site" ]] || fail "私有仓库缺少 site/ 目录"
source_site="$(cd -- "$source_repository/site" && pwd -P)"

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
target_root="$(cd -- "$script_directory/.." && pwd -P)"

[[ -f "$target_root/package.json" ]] || fail "脚本所在目录不是 ShokaX 站点"
[[ -d "$target_root/src" ]] || fail "目标站点缺少 src/ 目录"
[[ "$source_site" != "$target_root" ]] || fail "内容源与目标站点不能相同"

assert_regular_file() {
  local path="$1"
  [[ -f "$path" && ! -L "$path" ]] || fail "必须是普通文件：$path"
}

assert_no_symlinks() {
  local path="$1"
  [[ -d "$path" ]] || return 0

  if find "$path" -type l -print -quit | grep -q .; then
    fail "白名单目录中不允许符号链接：$path"
  fi
}

target_path() {
  local relative="$1"
  local path="$target_root/$relative"

  [[ "$path" == "$target_root/"* ]] || fail "非法目标路径：$relative"
  printf '%s' "$path"
}

reset_directory() {
  local relative="$1"
  local path
  path="$(target_path "$relative")"

  if [[ -e "$path" && ! -d "$path" ]]; then
    fail "目标路径不是目录：$path"
  fi

  rm -rf -- "$path"
  mkdir -p -- "$path"
}

copy_file() {
  local source="$1"
  local target_relative="$2"
  local target
  target="$(target_path "$target_relative")"

  assert_regular_file "$source"
  mkdir -p -- "$(dirname -- "$target")"
  cp -p -- "$source" "$target"
}

posts_source="$source_site/src/posts"
[[ -d "$posts_source" ]] || fail "私有仓库缺少 site/src/posts/"
assert_no_symlinks "$posts_source"

post_files=()
while IFS= read -r -d '' entry; do
  [[ -f "$entry" ]] || fail "文章目录只允许顶层 Markdown 文件：$entry"
  filename="$(basename -- "$entry")"
  [[ "$filename" =~ ^[0-9a-f]{12}\.(md|mdx)$ ]] ||
    fail "文章文件名必须是 12 位小写十六进制 hash：$filename"
  post_files+=("$entry")
done < <(find "$posts_source" -mindepth 1 -maxdepth 1 -print0)

(( ${#post_files[@]} > 0 )) || fail "site/src/posts/ 中没有可发布文章"

required_content=(
  "about.mdx"
  "subscribe.md"
  "friends-rules.md"
)

for filename in "${required_content[@]}"; do
  assert_regular_file "$source_site/src/content/$filename"
done
assert_regular_file "$source_site/src/data/friends.json"

reset_directory "src/posts"
reset_directory "src/moments"

for post in "${post_files[@]}"; do
  copy_file "$post" "src/posts/$(basename -- "$post")"
done

for filename in "${required_content[@]}"; do
  copy_file "$source_site/src/content/$filename" "src/content/$filename"
done
copy_file "$source_site/src/data/friends.json" "src/data/friends.json"

private_assets_source="$source_site/src/assets/private"
reset_directory "src/assets/private"
reset_directory "public/assets/private"

asset_count=0
if [[ -d "$private_assets_source" ]]; then
  assert_no_symlinks "$private_assets_source"

  while IFS= read -r -d '' asset; do
    relative="${asset#"$private_assets_source/"}"

    case "$relative" in
      avatar.webp | xicao.jpg) ;;
      categories/acg.jpg | categories/miku.jpg | categories/notes.jpg | categories/thoughts.jpg) ;;
      covers/*.jpg | covers/*.png | covers/*.webp)
        [[ "$(dirname -- "$relative")" == "covers" ]] ||
          fail "covers/ 不允许子目录：$relative"
        ;;
      *) fail "不在私有图片白名单中：$relative" ;;
    esac

    filename="$(basename -- "$relative")"
    [[ "$filename" =~ ^[A-Za-z0-9._-]+$ ]] || fail "图片文件名不安全：$relative"

    copy_file "$asset" "src/assets/private/$relative"
    copy_file "$asset" "public/assets/private/$relative"
    ((asset_count += 1))
  done < <(find "$private_assets_source" -type f -print0)
fi

public_source="$source_site/public"
target_public="$(target_path "public")"
mkdir -p -- "$target_public"

rm -f -- "$target_public/_headers"
while IFS= read -r -d '' stale_verification; do
  rm -f -- "$stale_verification"
done < <(find "$target_public" -maxdepth 1 -type f -name 'verification-follow_it-*.html' -print0)

verification_count=0
if [[ -d "$public_source" ]]; then
  assert_no_symlinks "$public_source"

  if [[ -e "$public_source/_headers" ]]; then
    copy_file "$public_source/_headers" "public/_headers"
  fi

  while IFS= read -r -d '' verification; do
    filename="$(basename -- "$verification")"
    [[ "$filename" =~ ^verification-follow_it-[A-Za-z0-9_-]+\.html$ ]] ||
      fail "Follow.it 验证文件名不安全：$filename"
    copy_file "$verification" "public/$filename"
    ((verification_count += 1))
  done < <(
    find "$public_source" -maxdepth 1 -type f -name 'verification-follow_it-*.html' -print0
  )
fi

printf '已装配 %d 篇文章、%d 个私有图片和 %d 个 Follow.it 验证文件。\n' \
  "${#post_files[@]}" "$asset_count" "$verification_count"
