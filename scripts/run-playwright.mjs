import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SUPPORTED_NODE_MAJORS = new Set([22, 24, 26]);

function fail(message) {
  console.error(`[playwright] ${message}`);
  process.exitCode = 1;
}

if (process.versions.bun) {
  fail(
    "Playwright 必须使用 Node.js，不能由 Bun 直接运行。请安装 Node.js 24 LTS，重新打开终端后再试。",
  );
} else {
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);

  if (!SUPPORTED_NODE_MAJORS.has(nodeMajor)) {
    fail(
      `当前 Node.js ${process.versions.node} 不受此版本 Playwright 支持；请使用 Node.js 22、24 或 26。`,
    );
  } else {
    const scriptDirectory = dirname(fileURLToPath(import.meta.url));
    const playwrightCli = resolve(
      scriptDirectory,
      "..",
      "node_modules",
      "@playwright",
      "test",
      "cli.js",
    );
    const result = spawnSync(process.execPath, [playwrightCli, ...process.argv.slice(2)], {
      stdio: "inherit",
      windowsHide: true,
    });

    if (result.error) {
      fail(`无法启动 Playwright：${result.error.message}`);
    } else if (result.signal) {
      fail(`Playwright 被信号 ${result.signal} 终止。`);
    } else {
      process.exitCode = result.status ?? 1;
    }
  }
}
