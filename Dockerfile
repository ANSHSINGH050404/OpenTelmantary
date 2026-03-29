services:
  app:
    build: .
    ports:
      - "5000:5000"

  sidecar:
    build: .
    command: node dist/proxy.js
    ports:
      - "3000:3000"
    depends_on:
      - app