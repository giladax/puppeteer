#!/usr/bin/env node

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { initPuppeteerRun, puppeteerLog } from "../logging/puppeteer-logger";

/**
 * Main Puppeteer CLI entry point.
 * @logdoc CLI orchestrator that analyzes logs and plans next iterations
 */
export function main() {
  const command = process.argv[2];
  const target = process.argv[3] || "logs";

  initPuppeteerRun({
    runId: `puppeteer_cli_${Date.now()}`,
    model: "claude-sonnet-4",
    sessionId: `cli_session_${Date.now()}`,
    tags: ["puppeteer-cli", "automation", "analysis"]
  });

  puppeteerLog("cli.start", { command, target });

  switch (command) {
    case "analyze":
      analyzeIterations(target);
      break;
    case "plan":
      planNextIteration(target);
      break;
    case "generate":
      generateNextIteration(target);
      break;
    case "setup":
      // Delegate to setup module
      const { setupPuppeteer } = require("./setup");
      setupPuppeteer();
      return;
    default:
      showUsage();
  }

  puppeteerLog("cli.complete", { command });
}

/**
 * Analyzes all iteration logs to understand development patterns.
 * @logdoc Log analysis engine for iteration tracking
 */
function analyzeIterations(logsDir: string) {
  puppeteerLog("analysis.start", { logsDir });

  const logFiles = getLogFiles(logsDir);
  const iterations: IterationSummary[] = [];

  for (const file of logFiles) {
    const summary = analyzeIteration(join(logsDir, file));
    iterations.push(summary);
    
    puppeteerLog("analysis.iteration.complete", {
      file,
      features: summary.features,
      eventCount: summary.totalEvents,
      success: summary.success
    });
  }

  const analysis = createAnalysisSummary(iterations);
  
  puppeteerLog("analysis.complete", {
    totalIterations: iterations.length,
    totalFeatures: analysis.allFeatures.length,
    recommendedNext: analysis.suggestedNextFeatures
  }, { snippet: true });

  console.log(JSON.stringify(analysis, null, 2));
}

interface IterationSummary {
  iterationId: string;
  features: string[];
  totalEvents: number;
  success: boolean;
  operations: string[];
  file: string;
}

/**
 * @nolog
 */
function getLogFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter(f => f.startsWith("iteration-") && f.endsWith(".jsonl"))
    .sort();
}

/**
 * @nolog
 */
function analyzeIteration(filePath: string): IterationSummary {
  const content = readFileSync(filePath, "utf8");
  const logs = content.trim().split("\n").map(line => JSON.parse(line));
  
  const sessionStart = logs.find(l => l.event === "demo.session.start");
  const sessionEnd = logs.find(l => l.event?.includes("session.success"));
  
  return {
    iterationId: sessionStart?.runId || "unknown",
    features: sessionStart?.features || [],
    totalEvents: logs.length,
    success: !!sessionEnd,
    operations: [...new Set(logs.map(l => l.event).filter(e => e?.startsWith("math.")))],
    file: filePath
  };
}

/**
 * @nolog
 */
function createAnalysisSummary(iterations: IterationSummary[]) {
  const allFeatures = [...new Set(iterations.flatMap(i => i.features))];
  const allOperations = [...new Set(iterations.flatMap(i => i.operations))];
  
  // Simple next feature suggestion logic
  const suggestedNext = [];
  if (!allFeatures.includes("variance")) suggestedNext.push("variance");
  if (!allFeatures.includes("median")) suggestedNext.push("median");
  if (!allFeatures.includes("mode")) suggestedNext.push("mode");
  
  return {
    iterations: iterations.length,
    allFeatures,
    allOperations,
    suggestedNextFeatures: suggestedNext.slice(0, 2),
    evolutionPath: iterations.map(i => ({ id: i.iterationId, features: i.features }))
  };
}

/**
 * @nolog
 */
function planNextIteration(logsDir: string) {
  puppeteerLog("planning.start", { logsDir });
  console.log("Planning next iteration based on log analysis...");
  // TODO: Implement planning logic
}

/**
 * @nolog
 */
function generateNextIteration(logsDir: string) {
  puppeteerLog("generation.start", { logsDir });
  console.log("Generating next iteration...");
  // TODO: Implement generation logic
}

/**
 * @nolog
 */
function showUsage() {
  console.log(`
🎭 Puppeteer CLI - Complete Control System

Usage:
  puppeteer-cli setup <name> <path> <description>  - Create new puppeteer system
  puppeteer-cli analyze [logs-dir]                 - Analyze iteration logs
  puppeteer-cli plan [logs-dir]                    - Plan next iteration
  puppeteer-cli generate [logs-dir]                - Generate next iteration

Examples:
  puppeteer-cli setup math ./src "Controls math operations"
  puppeteer-cli setup api ./services "Manages API calls with retry logic"  
  puppeteer-cli analyze logs
  puppeteer-cli plan logs
  `);
}

if (require.main === module) {
  main();
}