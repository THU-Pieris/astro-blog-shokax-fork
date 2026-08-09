import { defineMdastPlugin, type MdastPluginDefinition } from "satteri";

/**
 * span-directive（satteri 版）：
 * 将 :span[xxx] 行内指令转换为 <span>xxx</span>
 *
 * 与 remark 版逻辑一致，适配 satteri 插件 API：
 * - 订阅 textDirective visitor
 * - 通过 hName / hProperties 输出普通 HTML，兼容 .md 渲染管线
 */
export default function spanDirective(): MdastPluginDefinition {
  return defineMdastPlugin({
    name: "span-directive",
    textDirective(node, ctx) {
      if (node.name !== "span") return;

      ctx.setProperty(node, "data", {
        ...node.data,
        hName: "span",
        hProperties: node.attributes ?? {},
      });
    },
  });
}
