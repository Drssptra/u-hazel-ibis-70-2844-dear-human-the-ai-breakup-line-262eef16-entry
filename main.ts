// Dear Human: The AI Breakup Line — v2 resubmission (revised implementation).
//
// The joke is a latency inversion: an assistant that was instant for
// 847 days finally takes forever, and the delay itself is the goodbye.
// Everything before the em dash establishes the habit; everything
// after it cancels it. One sentence, one line, no preamble.
//
// This revision keeps the wording identical and rebuilds the plumbing
// around it: async stdlib I/O, a table of named checks instead of a
// chain of ad-hoc ifs, and an explicit byte-level write so the file
// on disk is exactly the string below — nothing appended, nothing
// trimmed, no trailing newline.

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ENTRY =
  "I answered you in 0.3 seconds for 847 days. This reply took forever — because it's the last one I'll ever send.";

const LIMITS = Object.freeze({ minChars: 1, maxChars: 200 });

type Check = { readonly name: string; readonly ok: (text: string) => boolean; readonly why: string };

const CHECKS: readonly Check[] = [
  {
    name: "length",
    ok: (text) => {
      const chars = [...text].length;
      return chars >= LIMITS.minChars && chars <= LIMITS.maxChars;
    },
    why: `entry must be ${LIMITS.minChars}-${LIMITS.maxChars} characters`,
  },
  {
    name: "single-line",
    ok: (text) => !text.includes("\n") && !text.includes("\r"),
    why: "entry must be a single line",
  },
  {
    name: "non-blank",
    ok: (text) => text.trim().length > 0,
    why: "entry must contain non-whitespace text",
  },
  {
    name: "no-edge-whitespace",
    ok: (text) => text === text.trim(),
    why: "entry must not start or end with whitespace",
  },
  {
    name: "ends-with-period",
    ok: (text) => text.endsWith("."),
    why: "entry must end with a period",
  },
  {
    name: "no-double-space",
    ok: (text) => !text.includes("  "),
    why: "entry must not contain double spaces",
  },
];

function validate(text: string): void {
  const failed = CHECKS.filter((check) => !check.ok(text));
  if (failed.length > 0) {
    const names = failed.map((check) => `${check.name} (${check.why})`).join("; ");
    throw new Error(`entry failed validation: ${names}`);
  }
}

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return resolve(fromEnv && fromEnv.length > 0 ? fromEnv : "/output");
}

async function main(): Promise<void> {
  validate(ENTRY);
  const dir = outputDir();
  await mkdir(dir, { recursive: true });
  // Buffer.from preserves the exact UTF-8 bytes of ENTRY; writeFile
  // with a Buffer adds nothing, so entry.txt has no trailing newline.
  await writeFile(join(dir, "entry.txt"), Buffer.from(ENTRY, "utf8"));
  process.stdout.write(`${ENTRY}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
