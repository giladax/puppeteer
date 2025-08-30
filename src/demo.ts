import { initPuppeteerRun, puppeteerLog } from "./logging/puppeteer-logger";

/**
 * Demo function that shows logger functionality.
 * @logdoc Demonstrates the Puppeteer logger with JSDoc integration
 */
export async function runDemo() {
  initPuppeteerRun({ 
    runId: "demo_run_001", 
    model: "claude-sonnet-4", 
    sessionId: "session_abc",
    tags: ["demo", "test"]
  });

  puppeteerLog("demo.start", { message: "Starting logger demo" });

  await processData("sample input");

  puppeteerLog("demo.complete", { message: "Demo finished successfully" }, { snippet: true });
}

/**
 * Processes input data and performs analysis.
 * This function demonstrates complex data processing
 * with multiple steps and validation.
 */
async function processData(input: string) {
  puppeteerLog("processing.start", { inputLength: input.length }, { stack: true });

  await new Promise(resolve => setTimeout(resolve, 50));

  puppeteerLog("processing.complete", { result: "success" });
}

/**
 * @nolog
 */
function helperFunction() {
  return "This function should not appear in logs";
}

if (require.main === module) {
  runDemo().catch(console.error);
}