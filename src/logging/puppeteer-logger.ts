import pino from "pino";
import { readFileSync } from "fs";
import "source-map-support/register";

type LogDocEntry = { start: number; end: number; name?: string; firstParagraph?: string; logdoc?: string };
type LogDocMap = Record<string, LogDocEntry[]>;

let LOGDOC: LogDocMap | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LOGDOC = require("../../dist/logdoc-map.json");
} catch {
  // ok in dev if not generated yet
}

export type PuppeteerRunMeta = {
  runId: string;
  model?: string;
  sessionId?: string;
  userId?: string;
  tags?: string[];
};

export type PuppeteerLogOptions = {
  stack?: boolean;
  snippet?: boolean | { context?: number };
};

const logger = pino({ level: process.env.PUPPETEER_LOG_LEVEL || "info" });

let runMeta: PuppeteerRunMeta | undefined;

export function initPuppeteerRun(meta: PuppeteerRunMeta) {
  runMeta = meta;
}

function getCaller(skip = 2) {
  const orig = Error.prepareStackTrace;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Error.prepareStackTrace = (_, s) => s as any;
  const e = new Error();
  Error.captureStackTrace(e, getCaller);
  const stack = e.stack as unknown as NodeJS.CallSite[];
  Error.prepareStackTrace = orig;
  const s = stack?.[skip];
  return {
    file: s?.getFileName() ?? undefined,
    line: s?.getLineNumber() ?? undefined,
    col: s?.getColumnNumber() ?? undefined,
    fn: s?.getFunctionName() ?? s?.getMethodName() ?? undefined,
  };
}

function lookupDesc(file?: string, line?: number) {
  if (!LOGDOC || !file || !line) return;
  let rel = file.replace(process.cwd() + "/", "");
  
  // Map compiled JS back to TS source
  if (rel.startsWith("dist/") && rel.endsWith(".js")) {
    rel = rel.replace("dist/", "src/").replace(".js", ".ts");
  }
  
  const entries = LOGDOC[rel];
  if (!entries) return;
  let lo = 0, hi = entries.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const e = entries[mid];
    if (line < e.start) hi = mid - 1;
    else if (line > e.end) lo = mid + 1;
    else return e.logdoc === "" ? undefined : (e.logdoc || e.firstParagraph);
  }
}

function getSnippet(file?: string, line?: number, context = 3) {
  if (!file || !line) return;
  try {
    const src = readFileSync(file, "utf8").split(/\r?\n/);
    const start = Math.max(1, line - context);
    const end = Math.min(src.length, line + context);
    const lines = [];
    for (let i = start; i <= end; i++) {
      const mark = i === line ? ">" : " ";
      lines.push(`${mark} ${String(i).padStart(4)} | ${src[i - 1]}`);
    }
    return lines.join("\n");
  } catch {
    return;
  }
}

export function puppeteerLog(
  event: string,
  payload: Record<string, unknown> = {},
  opts: PuppeteerLogOptions = {}
) {
  const { file, line, col, fn } = getCaller(2);
  const desc = lookupDesc(file, line);
  const contextLines = typeof opts.snippet === "object" ? opts.snippet.context : 3;
  const codeSnippet = opts.snippet ? getSnippet(file, line, contextLines) : undefined;

  logger.info({
    ts: new Date().toISOString(),
    level: "info",
    service: "Puppeteer",
    event,

    ...runMeta,

    functionName: fn,
    file, line, column: col,

    desc,

    stack: opts.stack ? new Error().stack : undefined,
    codeSnippet,

    ...payload,
  });
}