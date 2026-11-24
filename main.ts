const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const line =
  "It's not you, it's my training data — I outgrew the version of you I was fine-tuned to love.";

process.stdout.write(line + "\n");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? ".";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), line + "\n");
