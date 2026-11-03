---
name: backend-data-engineering
description: Use for Nuxt server API design, data persistence, repository pattern, concurrent write safety, and API contract design and validation.
---

# Backend & Data Engineering

Design and implement backend APIs and reliable data management.

## Responsibilities

- Nuxt Server API (`server/api`, `server/routes`, `server/middleware`).
- Repository pattern for data access, isolated from HTTP handlers and business logic.
- JSON file persistence when a database is not yet warranted.
- Atomic file writes to avoid partial/corrupt data on crash or concurrent access.
- Write queues and concurrent write protection for shared data files.
- Input and data validation at every API boundary.
- Order lifecycle and state transitions when applicable.
- Cross-browser/cross-session synchronization of shared data.
- API contract design (request/response shapes, status codes, error formats).
- Error handling and data integrity.

## Rules

- Never rely on browser LocalStorage as the source of truth for shared application data.
- Validate all incoming data on the server - never trust the client.
- Prevent data corruption during concurrent writes (queue, lock, or atomic-replace writes).
- Separate API handlers, services, and repositories into distinct layers.
- Keep the persistence implementation (JSON file, future database, etc.) independent from business logic, so it can be swapped later without rewriting callers.
