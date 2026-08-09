import { describe, expect, it } from "bun:test";
import { parseFriendLinks } from "./friendsData";

describe("parseFriendLinks", () => {
  it("接受展平友链并保留可选字段", () => {
    expect(
      parseFriendLinks([
        {
          url: "https://example.com/",
          title: "Example",
          desc: "示例站点",
          color: "#58b2dc",
        },
        {
          url: "https://example.org/",
          title: "No optional fields",
        },
      ]),
    ).toEqual([
      {
        url: "https://example.com/",
        title: "Example",
        desc: "示例站点",
        color: "#58b2dc",
      },
      {
        url: "https://example.org/",
        title: "No optional fields",
      },
    ]);
  });

  it("拒绝非数组、缺少标题和非 HTTP(S) 链接", () => {
    expect(() => parseFriendLinks({})).toThrow("顶层必须是数组");
    expect(() => parseFriendLinks([{ url: "https://example.com/" }])).toThrow(
      "title 必须是非空字符串",
    );
    expect(() => parseFriendLinks([{ url: "javascript:alert(1)", title: "Bad" }])).toThrow(
      "只允许 HTTP(S) 链接",
    );
  });
});
