#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { puppeteerLog, initPuppeteerRun } from "../logging/puppeteer-logger";

/**
 * CLI command to setup a complete puppeteer system.
 * @logdoc Puppeteer setup generator with schemas and wrapper
 */
export function setupPuppeteer() {
  // Skip first arg which is 'setup'
  const args = process.argv.slice(3);
  
  if (args.length < 3) {
    showSetupUsage();
    return;
  }

  const [name, targetPath, description, ...docParts] = args;
  const docs = [description, ...docParts].join(" ") || `Controls ${name} operations`;

  initPuppeteerRun({
    runId: `setup_${name}_${Date.now()}`,
    model: "claude-sonnet-4",
    sessionId: `setup_session_${Date.now()}`,
    tags: ["puppeteer-setup", "cli", "generation"]
  });

  puppeteerLog("setup.start", {
    puppeteerName: name,
    targetPath,
    description: docs
  });

  generatePuppeteerSystem(name, targetPath, docs);

  puppeteerLog("setup.complete", {
    puppeteerName: name,
    generatedFiles: 5
  });
}

/**
 * Generates complete puppeteer system with schemas and wrapper.
 * @logdoc Full system generator - schemas, specs, wrapper
 */
function generatePuppeteerSystem(name: string, targetPath: string, docs: string) {
  const puppeteerDir = join(targetPath, `${name}-puppeteer`);
  const schemasDir = join(puppeteerDir, "schemas");
  const specsDir = join(puppeteerDir, "specs");
  
  puppeteerLog("setup.directories", {
    puppeteerDir,
    schemasDir, 
    specsDir
  });

  // Create directory structure
  mkdirSync(puppeteerDir, { recursive: true });
  mkdirSync(schemasDir, { recursive: true });
  mkdirSync(specsDir, { recursive: true });

  // Generate base schemas
  generateEventSchemas(name, schemasDir);
  
  // Generate specs  
  generateSpecs(name, specsDir);
  
  // Generate wrapper
  generateWrapper(name, puppeteerDir, docs);
  
  // Generate config
  generateConfig(name, puppeteerDir, docs);

  puppeteerLog("setup.generation.complete", {
    puppeteerName: name,
    filesGenerated: ["schemas", "specs", "wrapper", "config"]
  });
}

/**
 * Generates Zod schemas for puppeteer events.
 * @logdoc Auto-generated event schemas with validation
 */
function generateEventSchemas(name: string, schemasDir: string) {
  puppeteerLog("schemas.generation.start", { puppeteerName: name });

  const baseEventSchema = `import { z } from "zod";

// Base event schema for ${name} puppeteer
export const ${capitalize(name)}BaseEventSchema = z.object({
  event: z.string(),
  puppeteerName: z.literal("${name}"),
  timestamp: z.string().datetime(),
  executionId: z.string(),
  functionName: z.string().optional(),
  inputCount: z.number().optional(),
  success: z.boolean().optional()
});

// Operation start event
export const ${capitalize(name)}StartEventSchema = ${capitalize(name)}BaseEventSchema.extend({
  event: z.string().regex(/\\.(start|begin)$/),
  inputs: z.array(z.unknown()).optional(),
  inputPreview: z.array(z.unknown()).optional(),
  mode: z.enum(["normal", "debug", "trace"]).optional()
});

// Operation complete event  
export const ${capitalize(name)}CompleteEventSchema = ${capitalize(name)}BaseEventSchema.extend({
  event: z.string().regex(/\\.(complete|done|finish)$/),
  result: z.unknown().optional(),
  duration: z.number().optional(),
  success: z.literal(true)
});

// Operation error event
export const ${capitalize(name)}ErrorEventSchema = ${capitalize(name)}BaseEventSchema.extend({
  event: z.string().regex(/\\.(error|fail)$/),
  error: z.string(),
  errorType: z.string().optional(),
  stack: z.string().optional(),
  success: z.literal(false)
});

// Union of all event types
export const ${capitalize(name)}EventSchema = z.union([
  ${capitalize(name)}StartEventSchema,
  ${capitalize(name)}CompleteEventSchema,
  ${capitalize(name)}ErrorEventSchema
]);

export type ${capitalize(name)}Event = z.infer<typeof ${capitalize(name)}EventSchema>;
export type ${capitalize(name)}StartEvent = z.infer<typeof ${capitalize(name)}StartEventSchema>;
export type ${capitalize(name)}CompleteEvent = z.infer<typeof ${capitalize(name)}CompleteEventSchema>;
export type ${capitalize(name)}ErrorEvent = z.infer<typeof ${capitalize(name)}ErrorEventSchema>;
`;

  writeFileSync(join(schemasDir, "events.ts"), baseEventSchema);
  
  puppeteerLog("schemas.base.generated", {
    puppeteerName: name,
    schemaFile: "events.ts"
  });
}

/**
 * Generates specs that validate puppeteer events.
 * @logdoc Event validation specs using generated schemas
 */
function generateSpecs(name: string, specsDir: string) {
  puppeteerLog("specs.generation.start", { puppeteerName: name });

  const specsContent = `import { ${capitalize(name)}EventSchema, ${capitalize(name)}Event } from "../schemas/events";

/**
 * Validates a single ${name} puppeteer event.
 */
export function validate${capitalize(name)}Event(event: unknown): ${capitalize(name)}Event {
  return ${capitalize(name)}EventSchema.parse(event);
}

/**
 * Validates an array of ${name} puppeteer events.
 */
export function validate${capitalize(name)}Events(events: unknown[]): ${capitalize(name)}Event[] {
  return events.map(event => validate${capitalize(name)}Event(event));
}

/**
 * Type guard for ${name} events.
 */
export function is${capitalize(name)}Event(event: unknown): event is ${capitalize(name)}Event {
  return ${capitalize(name)}EventSchema.safeParse(event).success;
}

/**
 * Filters and validates ${name} events from mixed log stream.
 */
export function extract${capitalize(name)}Events(logs: unknown[]): ${capitalize(name)}Event[] {
  return logs
    .filter(log => is${capitalize(name)}Event(log))
    .map(log => validate${capitalize(name)}Event(log));
}
`;

  writeFileSync(join(specsDir, "validators.ts"), specsContent);
  
  puppeteerLog("specs.validators.generated", {
    puppeteerName: name,
    specFile: "validators.ts"
  });
}

/**
 * Generates the main puppeteer wrapper file.
 * @logdoc Complete wrapper generator with bootstrap integration
 */
function generateWrapper(name: string, puppeteerDir: string, docs: string) {
  puppeteerLog("wrapper.generation.start", { 
    puppeteerName: name,
    systemPrompt: docs.slice(0, 100)
  });

  const wrapperContent = `import { initPuppeteerRun, puppeteerLog } from "../logging/puppeteer-logger";
import { puppeteerBootstrap } from "../puppeteer-cli/bootstrap";
import { ${capitalize(name)}Event } from "./schemas/events";
import { validate${capitalize(name)}Event } from "./specs/validators";

/**
 * ${docs}
 * @logdoc ${name} puppeteer controller with schema validation
 */
export class ${capitalize(name)}Puppeteer {
  private runId: string;
  private events: ${capitalize(name)}Event[] = [];

  constructor(runId: string = \`${name}_\${Date.now()}\`) {
    this.runId = runId;
    
    initPuppeteerRun({
      runId: this.runId,
      model: "claude-sonnet-4",
      sessionId: \`${name}_session_\${Date.now()}\`,
      tags: ["${name}-puppeteer", "automated", "controlled"]
    });

    puppeteerLog("puppeteer.init", {
      puppeteerName: "${name}",
      runId: this.runId,
      systemPrompt: "${docs}"
    });
  }

  /**
   * Wraps any function with ${name} puppeteer control.
   * @logdoc Function wrapper with automatic schema validation
   */
  control<T extends (...args: any[]) => any>(
    fn: T,
    eventPrefix?: string
  ): T {
    const prefix = eventPrefix || \`${name}.\${fn.name || "anonymous"}\`;
    
    puppeteerLog("puppeteer.control.attach", {
      functionName: fn.name,
      eventPrefix: prefix,
      puppeteerName: "${name}"
    });

    return puppeteerBootstrap(fn, {
      eventPrefix: prefix,
      executionGate: "always",
      resultLogging: "full",
      includeSnippet: true
    });
  }

  /**
   * Wraps an entire module with ${name} puppeteer control.
   * @logdoc Module-level control with bulk schema validation
   */
  controlModule<T extends Record<string, any>>(
    module: T,
    modulePrefix?: string
  ): any {
    const prefix = modulePrefix || \`${name}.module\`;
    
    puppeteerLog("puppeteer.module.control", {
      moduleName: module.constructor?.name || "unknown",
      functionCount: Object.keys(module).filter(k => typeof module[k] === "function").length,
      eventPrefix: prefix
    });

    const controlled: any = {};
    
    for (const [key, value] of Object.entries(module)) {
      if (typeof value === "function") {
        controlled[key] = this.control(value, \`\${prefix}.\${key}\`);
      } else {
        controlled[key] = value;
      }
    }

    return controlled;
  }

  /**
   * Validates and stores a puppeteer event.
   * @logdoc Event validation and storage with schema checking
   */
  validateEvent(event: unknown): ${capitalize(name)}Event {
    try {
      const validEvent = validate${capitalize(name)}Event(event);
      this.events.push(validEvent);
      
      puppeteerLog("puppeteer.event.validated", {
        eventType: validEvent.event,
        totalEvents: this.events.length
      });
      
      return validEvent;
    } catch (error) {
      puppeteerLog("puppeteer.event.invalid", {
        error: error instanceof Error ? error.message : String(error)
      }, { stack: true });
      
      throw error;
    }
  }

  /**
   * Gets all captured events for analysis.
   * @logdoc Event retrieval for puppeteer analysis
   */
  getEvents(): ${capitalize(name)}Event[] {
    return [...this.events];
  }

  /**
   * Analyzes captured events and suggests next actions.
   * @logdoc Event analysis and next action planning
   */
  analyze(): any {
    puppeteerLog("puppeteer.analyze.start", {
      totalEvents: this.events.length,
      puppeteerName: "${name}"
    });

    const analysis = {
      totalEvents: this.events.length,
      eventTypes: [...new Set(this.events.map(e => e.event))],
      successRate: this.events.filter(e => e.success === true).length / this.events.length,
      errors: this.events.filter(e => e.success === false),
      suggestions: this.generateSuggestions()
    };

    puppeteerLog("puppeteer.analyze.complete", analysis);
    
    return analysis;
  }

  private generateSuggestions(): string[] {
    // Simple suggestion logic based on captured events
    const suggestions = [];
    
    if (this.events.length > 100) {
      suggestions.push("Consider log rotation");
    }
    
    if (this.events.filter(e => e.success === false).length > 5) {
      suggestions.push("Review error handling patterns");
    }
    
    return suggestions;
  }
}

// Export convenience functions
export function create${capitalize(name)}Puppeteer(runId?: string): ${capitalize(name)}Puppeteer {
  return new ${capitalize(name)}Puppeteer(runId);
}

export function quick${capitalize(name)}Control<T extends (...args: any[]) => any>(
  fn: T,
  runId?: string
): T {
  const puppeteer = create${capitalize(name)}Puppeteer(runId);
  return puppeteer.control(fn);
}
`;

  writeFileSync(join(puppeteerDir, "index.ts"), wrapperContent);
  
  puppeteerLog("wrapper.generated", {
    puppeteerName: name,
    wrapperFile: "index.ts",
    capabilities: ["control", "controlModule", "validateEvent", "analyze"]
  });
}

/**
 * Generates configuration file for the puppeteer.
 * @logdoc Configuration generator with system prompt
 */
function generateConfig(name: string, puppeteerDir: string, docs: string) {
  const configContent = `export const ${name.toUpperCase()}_PUPPETEER_CONFIG = {
  name: "${name}",
  version: "1.0.0",
  systemPrompt: \`${docs}\`,
  
  // Default control settings
  defaultStrings: {
    executionGate: "always" as const,
    errorHandling: "throw" as const, 
    resultLogging: "full" as const,
    includeStack: false,
    includeSnippet: true
  },
  
  // Event prefixes
  eventPrefixes: {
    operation: "${name}.op",
    validation: "${name}.validate", 
    error: "${name}.error",
    analysis: "${name}.analyze"
  },
  
  // Schema validation
  strictValidation: true,
  logInvalidEvents: true
} as const;

export type ${capitalize(name)}PuppeteerConfig = typeof ${name.toUpperCase()}_PUPPETEER_CONFIG;
`;

  writeFileSync(join(puppeteerDir, "config.ts"), configContent);
  
  puppeteerLog("config.generated", {
    puppeteerName: name,
    configFile: "config.ts"
  });
}

/**
 * @nolog
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * @nolog
 */
function showSetupUsage() {
  console.log(`
🎭 Puppeteer Setup CLI

Usage:
  setup <name> <path> <description> [extended-docs...]

Arguments:
  name         - Puppeteer name (e.g., "math", "api", "data")
  path         - Target directory path  
  description  - System prompt/docs for the puppeteer

Examples:
  setup math ./src "Controls mathematical operations with validation"
  setup api ./services "Manages API calls with retry logic and logging"
  setup data ./processors "Handles data processing with transformation tracking"

Generated structure:
  <path>/<name>-puppeteer/
    ├── index.ts        # Main wrapper class
    ├── config.ts       # Configuration and system prompt
    ├── schemas/        # Zod event schemas
    │   └── events.ts   # Auto-generated schemas
    └── specs/          # Validation specs
        └── validators.ts # Schema validators

The generated puppeteer can:
- Control any function with: puppeteer.control(fn)
- Control entire modules with: puppeteer.controlModule(module)  
- Validate events with schemas
- Analyze captured events
- Suggest next iterations
`);
}

if (require.main === module) {
  setupPuppeteer();
}