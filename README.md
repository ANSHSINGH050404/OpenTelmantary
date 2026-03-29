# OpenTelmantary

A high-performance TypeScript/Node.js reverse proxy sidecar designed to forward HTTP requests while seamlessly propagating OpenTelemetry trace context. This sidecar provides essential reliability and observability features for microservices.

## Features

- **OpenTelemetry Tracing:** Automatic instrumentation for Express and HTTP requests, ensuring full W3C trace context propagation across services.
- **Prometheus Metrics:** Exports standardized metrics via OTLP for monitoring and alerting.
- **Reverse Proxy:** Robust request forwarding to a target service using `http-proxy`.
- **LRU Caching:** In-memory caching for GET requests with configurable TTL and maximum size to reduce target load and improve performance.
- **Rate Limiting:** Integrated protection against traffic spikes and abuse.
- **Circuit Breaker:** Prevents cascading failures by monitoring service health and temporarily stopping requests to failing targets.
- **Health & Readiness Checks:** Built-in `/health` and `/ready` endpoints for container orchestration platforms like Kubernetes.
- **TLS/HTTPS Support:** Optional support for secure communication using TLS certificates.
- **Environment Driven Configuration:** Fully configurable via environment variables for easy deployment.

## Installation

```bash
npm install
```

## Usage

### Development

Run the sidecar directly with `ts-node`:

```bash
npm run dev
```

### Production

Build and start the compiled JavaScript:

```bash
npm run build
npm start
```

### Docker

Build and run using Docker:

```bash
docker build -t otel-bridge-sidecar .
docker run -p 3000:3000 -e TARGET=http://your-service:5000 otel-bridge-sidecar
```

## Configuration

The sidecar can be configured using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the sidecar to listen on | `3000` |
| `TARGET` | Target URL to forward requests to | `http://localhost:5000` |
| `TLS_ENABLED` | Enable HTTPS support | `false` |
| `TLS_KEY_PATH` | Path to TLS private key file | - |
| `TLS_CERT_PATH` | Path to TLS certificate file | - |
| `CACHE_ENABLED` | Enable LRU caching for GET requests | `true` |
| `CACHE_MAX` | Maximum number of items in cache | `1000` |
| `CACHE_TTL` | Cache TTL in milliseconds | `60000` |
| `CIRCUIT_BREAKER_ENABLED` | Enable circuit breaker | `true` |
| `CB_FAILURE_THRESHOLD` | Number of failures before opening | `5` |
| `CB_SUCCESS_THRESHOLD` | Number of successes before closing | `2` |
| `CB_RESET_TIMEOUT` | Time (ms) before transitioning to half-open | `30000` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `60000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

## OpenTelemetry Integration

The sidecar uses `@opentelemetry/sdk-node` for automatic instrumentation. Ensure you have an OTLP-compatible collector (like Jaeger or Honeycomb) configured to receive traces and metrics.

## License

ISC
