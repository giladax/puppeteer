# 🎭 Puppeteer Logger

A production-grade logging system where **logs are the strings** controlling the **puppet** (your code).

## Philosophy

- **🎭 Puppeteer** (Developer/LLM) controls the system
- **🪢 Strings** (Logs/Tools) control code execution  
- **🤖 Puppet** (Your functions) execute under complete control

> "The logs are the strings holding the puppets" - logs don't just record, they control behavior.

## Quick Start

### 1. Generate a Puppeteer System

```bash
npm run cli setup data ./src "Controls data processing with validation"
```

This creates a complete system:
```
src/data-puppeteer/
├── index.ts          # DataPuppeteer class
├── config.ts         # Configuration  
├── schemas/events.ts # Zod validation schemas
└── specs/validators.ts # Event validators
```

### 2. Control Any Function (Zero Modification)

```typescript
import { createDataPuppeteer } from './data-puppeteer';

// Your existing function - no changes needed
function processData(input: string) {
  return input.toUpperCase();
}

// Wrap with puppeteer control
const puppeteer = createDataPuppeteer();
const controlled = puppeteer.control(processData);

// Now logs control everything
const result = controlled("hello"); // Fully logged and controlled
```

### 3. Control Entire Modules

```typescript
import * as utils from './legacy-utils';

const puppeteer = createDataPuppeteer();
const controlledUtils = puppeteer.controlModule(utils);

// All functions now under puppeteer control
controlledUtils.transform(data);
controlledUtils.validate(schema);
```

## Features

✅ **Zero Code Modification** - Retrofit any existing codebase  
✅ **Auto-Generated Schemas** - Zod validation with TypeScript types  
✅ **Complete Control** - Logs control execution, errors, and results  
✅ **Production-Grade** - Pino logging with proper error handling  
✅ **CLI Generation** - One command creates complete systems  
✅ **JSDoc Integration** - Automatic documentation extraction

## Core Components

### Logger (`src/logging/puppeteer-logger.ts`)
- Focused fields: functionName, desc, stack, codeSnippet, run metadata
- Pino-based for production performance
- JSDoc integration with @logdoc/@nolog tags
- Source map support for TypeScript stack traces

### Bootstrap Wrapper (`src/puppeteer-cli/bootstrap.ts`)
- `puppeteerBootstrap(fn, logStrings)` - wrap any function
- `puppeteerBootstrapModule(module, globalStrings)` - wrap entire modules
- Zero modification of original code required

### CLI System (`src/puppeteer-cli/`)
- `setup` - Generate complete puppeteer systems
- `analyze` - Analyze captured logs
- `plan` - Plan next development iterations
- Auto-generates Zod schemas and validators

## Available Commands

```bash
# Generate new puppeteer system
npm run cli setup <name> <path> <description>

# Analyze logs
npm run cli analyze logs

# Plan next iteration  
npm run cli plan logs

# Show help
npm run cli
```

## Development Scripts

```bash
npm run build        # Build TypeScript
npm run test         # Run Jest tests
npm run lint         # ESLint check
npm run format       # Prettier format
npm run ci          # Full CI pipeline
```

## Generated Schema Example

```typescript
// Auto-generated in schemas/events.ts
export const DataEventSchema = z.union([
  DataStartEventSchema,    // .start, .begin events
  DataCompleteEventSchema, // .complete, .done events  
  DataErrorEventSchema     // .error, .fail events
]);

export type DataEvent = z.infer<typeof DataEventSchema>;
```

## Documentation

- [CLI Usage Guide](./CLI_USAGE_GUIDE.md) - Complete CLI documentation
- [Philosophy](./PHILOSOPHY.md) - Core concepts and metaphors
- [Agent Rules](./PUPPETEER_AGENT_RULES.md) - Rules for puppeteer agents
- [System Summary](./SYSTEM_SUMMARY.md) - Technical implementation details

## Example: Math Puppeteer

```typescript
import { createMathPuppeteer } from './src/math-tales/math-puppeteer';

const puppeteer = createMathPuppeteer();

// Control existing math functions
const controlled = puppeteer.controlModule({
  add: (a, b) => a + b,
  multiply: (a, b) => a * b
});

controlled.add(2, 3);      // Fully logged and controlled
controlled.multiply(4, 5); // Schema-validated events

// Analyze captured events
const analysis = puppeteer.analyze();
console.log(analysis.successRate); // 1.0
```

## Architecture

The system follows the **Log-Driven Development** pattern:

1. **Bootstrap** existing functions with zero modification
2. **Capture** all execution events with schema validation  
3. **Analyze** patterns to guide next development steps
4. **Generate** new features based on captured insights
5. **Iterate** continuously with log-guided development

## Backend Integration (Planned)

### LLM Puppeteer Service
The system is designed to work with a backend service that enables LLM agents to interact with CLI requests:

- **Remote CLI Execution** - LLMs can invoke CLI commands through API endpoints
- **Event Streaming** - Real-time log events streamed to connected LLM agents  
- **Schema Synchronization** - Auto-sync generated Zod schemas with backend validation
- **Agent Orchestration** - Multiple LLM agents can coordinate through shared puppeteer instances

### API Endpoints (Planned)
```typescript
POST /cli/setup          // Generate new puppeteer system
POST /cli/analyze        // Analyze captured logs  
POST /cli/plan          // Plan next development iteration
GET  /events/stream     // WebSocket for real-time events
POST /events/validate   // Validate events against schemas
```

### Agent Integration Flow
1. **LLM Agent** requests puppeteer setup via API
2. **Backend Service** executes CLI and returns generated system
3. **Puppeteer Events** stream to agent for real-time analysis
4. **Agent** uses captured patterns to plan and execute next steps
5. **Continuous Loop** of analysis → planning → generation → capture

This enables true **LLM-driven development** where AI agents use the puppeteer system to iteratively improve code based on captured execution patterns.

## License

ISC