import { defineMdastPlugin, type MdastPluginDefinition } from "satteri";
import { parsePostLanguage } from "../toolkit/posts/postLanguage";

/**
 * 将 :::lang{code=ja} 转换为保留 Markdown 子节点的 <div lang="ja">。
 */
export default function langDirective(): MdastPluginDefinition {
  return defineMdastPlugin({
    name: "lang-directive",
    containerDirective(node, ctx) {
      if (node.name !== "lang") return;

      const attributes = node.attributes ?? {};
      const unsupportedAttributes = Object.keys(attributes).filter((name) => name !== "code");
      if (unsupportedAttributes.length > 0) {
        throw new Error(`:::lang 仅支持 code 属性，不支持：${unsupportedAttributes.join("、")}`);
      }

      let lang;
      try {
        lang = parsePostLanguage(attributes.code);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`:::lang 的 code 无效；${reason}`, { cause: error });
      }

      ctx.setProperty(node, "data", {
        ...node.data,
        hName: "div",
        hProperties: { lang },
      });
    },
  });
}
