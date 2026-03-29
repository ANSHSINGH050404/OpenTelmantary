# Agent Guidelines for OpenTelemetry Bridge Sidecar

## Project Overview

This is a TypeScript/Node.js project implementing an OpenTelemetry bridge sidecar - a reverse proxy that forwards HTTP requests while propagating OpenTelemetry trace context. The project uses Express for the HTTP server and http-proxy for request forwarding.

## Build, Lint, and Test Commands

### Build
```bash
npm run build    # Compile TypeScript to dist/ using tsc
npm run start    # Run compiled JavaScript from dist/
npm run dev      # Run TypeScript directly using ts-node
```

### Type Checking
```bash
npx tsc --noEmit    # Check for TypeScript errors without emitting files
```

### Testing
Tests are currently not configured. When tests are added:
```bash
npm test           # Run all tests
npx jest --testNamePattern="specific test"  # Run a single test
```

## Code Style Guidelines

### General Principles
- Use strict TypeScript mode with all strict checks enabled
- Prefer explicit types over inference for function parameters and return types
- Use CommonJS module format (`type: "commonjs"` in package.json)
- Avoid ES modules syntax in favor of require() for compatibility

### Naming Conventions
- **Files**: Use kebab-case (e.g., `http-handler.ts`, `trace-propagator.ts`)
- **Classes**: Use PascalCase (e.g., `ProxyServer`, `TraceContext`)
- **Functions/Variables**: Use camelCase (e.g., `getTraceId`, `proxyRequest`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`, `MAX_RETRIES`)
- **Interfaces**: Use PascalCase with `I` prefix optional (e.g., `ProxyConfig`)

### Imports
- Use `import x from "module"` for default exports
- Use `import { x, y } from "module"` for named exports
- Group imports: external libraries first, then internal modules
- Use require() for CommonJS compatibility when needed

### TypeScript Specifics
- Enable strict mode in tsconfig
- Use explicit return types for exported functions
- Prefer interfaces over types for object shapes
- Use `unknown` instead of `any` - narrow with type guards
- Never use `any` unless absolutely necessary; use `unknown` instead

### Error Handling
- Always use typed error handling with custom error classes
- Propagate errors with context (use error wrapping)
- Log errors with appropriate levels (error for failures, warn for recoverable issues)
- Never silently catch and ignore errors
- Use try-catch for async operations and handle rejections

### Async/Await
- Always handle promise rejections with try-catch or .catch()
- Use explicit return types for async functions
- Avoid mixing callbacks with async/await
- Use `Promise.all()` for parallel operations, `Promise.allSettled()` when partial failures are acceptable

### OpenTelemetry Integration
- Use `@opentelemetry/api` for trace context propagation
- Use `W3CTraceContextPropagator` from `@opentelemetry/api` for W3C trace context
- Always extract and inject trace context in proxy middleware
- Create spans for important operations (proxying, caching, etc.)
- Add relevant attributes to spans (url, method, status code, error info)

### Proxy Server Guidelines
- Configure appropriate timeouts for proxy requests
- Handle proxy errors gracefully with proper error responses
- Log proxy events (error, econnreset, etc.)
- Use connection pooling when possible

### Caching
- Use `lru-cache` for in-memory caching with TTL
- Use `p-limit` for concurrency limiting
- Configure appropriate cache sizes and TTLs based on use case

### Security
- Never log sensitive information (credentials, tokens, secrets)
- Validate and sanitize all input data
- Use environment variables for configuration (target URL, ports, etc.)
- Implement rate limiting to prevent abuse

### Code Organization
- Single responsibility: each file/module should do one thing well
- Export types and interfaces that are used externally
- Keep functions small and focused (max 30-40 lines per function)
- Use clear, descriptive names that reveal intent

### Comments
- Write self-documenting code - prefer clear naming over comments
- Use JSDoc for public APIs and complex functions
- Document "why" not "what" - explain business logic decisions
- Never leave commented-out code; remove it

### Testing
- Write unit tests for utility functions and helpers
- Write integration tests for HTTP handlers and proxy behavior
- Use descriptive test names that explain the scenario
- Test both success and failure paths
- Mock external dependencies (network calls, file system)

## File Structure
```
/src           - Source code (or root for simple projects)
/dist          - Compiled JavaScript output
/tests         - Test files (or co-located with source)
/types         - Custom type declarations
```
