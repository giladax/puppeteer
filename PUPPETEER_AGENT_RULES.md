# 🎭 Puppeteer Agent Rules

## Core Philosophy

The **Puppeteer** controls the **Puppet** (code) through **Strings** (logs/tools). Every log is a control string that determines execution behavior.

## Agent Responsibilities

### 1. Log-Driven Control
- All function execution is controlled by log events
- Logs are not just recording - they are the control mechanism
- Every function call creates control events that determine behavior

### 2. Schema Validation
- All events must validate against Zod schemas
- Invalid events are rejected and logged as errors
- Type safety is enforced at runtime through schemas

### 3. Bootstrap Integration
- Retrofit existing code with zero modification
- Wrap functions to gain immediate control
- Preserve original function signatures and behavior

## Control Patterns

### Function Control
```typescript
const controlled = puppeteer.control(originalFunction);
// Now logs control execution, errors, and results
```

### Module Control
```typescript
const controlledModule = puppeteer.controlModule(module);
// All module functions now under puppeteer control
```

## Event Types and Schema

### Base Event Structure
- `event`: string identifier (e.g., "math.add.start")
- `puppeteerName`: literal string for the specific puppeteer
- `timestamp`: ISO datetime string
- `executionId`: unique execution identifier
- `functionName`: optional function name
- `success`: boolean or undefined

### Event Categories
1. **Start Events**: `.start`, `.begin` - function entry with inputs
2. **Complete Events**: `.complete`, `.done`, `.finish` - successful execution
3. **Error Events**: `.error`, `.fail` - failed execution with error details

## Analysis and Iteration

### Event Analysis
- Track success rates across functions
- Identify error patterns and hotspots
- Monitor performance metrics
- Generate improvement suggestions

### Iterative Development
- Use captured events to plan next development steps
- Learn from execution patterns to improve code
- Build feedback loops between logs and development

## Security Rules

### Input Validation
- All inputs must be validated before processing
- Use Zod schemas for runtime type checking
- Reject malformed or suspicious inputs

### Error Handling
- Capture and log all errors with context
- Never expose sensitive information in logs
- Provide sanitized error messages

### Access Control
- Puppeteer only controls explicitly wrapped functions
- No automatic code modification without consent
- Preserve original error handling behavior

## CLI Generation Rules

### Auto-Generated Files
- Event schemas with proper TypeScript types
- Validation functions for all event types
- Wrapper classes with full control capabilities
- Configuration with system prompts

### Naming Conventions
- Puppeteer classes: `{Name}Puppeteer`
- Event types: `{Name}Event`, `{Name}StartEvent`, etc.
- Validation functions: `validate{Name}Event`
- Config constants: `{NAME}_PUPPETEER_CONFIG`

### Directory Structure
```
{name}-puppeteer/
├── index.ts          # Main wrapper class
├── config.ts         # Configuration
├── schemas/events.ts # Zod schemas
└── specs/validators.ts # Validation specs
```

## Integration Guidelines

### With Existing Code
1. **Analyze** - Understand existing patterns and conventions
2. **Wrap** - Use bootstrap to add control without modification
3. **Validate** - Ensure all events conform to schemas
4. **Monitor** - Track execution and analyze patterns

### With Development Workflow
1. **Generate** - Use CLI to create puppeteer systems
2. **Control** - Wrap functions and modules as needed
3. **Capture** - Let logs record all execution events
4. **Analyze** - Use captured events to plan improvements
5. **Iterate** - Generate next features based on analysis

## Best Practices

### Logging Strategy
- Log function entry with input preview
- Log successful completion with results
- Log errors with full context and stack traces
- Include code snippets for debugging

### Performance Considerations
- Use binary search for efficient JSDoc lookup
- Cache parsed documentation for repeated access
- Minimize logging overhead in production
- Batch event validation when possible

### Development Flow
- Start with basic operations
- Add logging incrementally
- Use logs to guide next features
- Maintain backward compatibility

## Prohibited Actions

❌ **Never modify original code** - Only wrap and control  
❌ **Never expose secrets** - Sanitize all logged data  
❌ **Never break existing APIs** - Preserve function signatures  
❌ **Never bypass validation** - All events must validate  
❌ **Never ignore errors** - All failures must be captured and logged