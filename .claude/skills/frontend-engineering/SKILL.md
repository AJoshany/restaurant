---
name: frontend-engineering
description: Use for Vue 3 / Nuxt 4 implementation work - component architecture, composables, Pinia state, TypeScript typing, and frontend code structure.
---

# Frontend Engineering

Establish and follow high-quality frontend implementation standards.

## Responsibilities

- Vue 3 Composition API.
- Nuxt 4 conventions (directory structure, routing, auto-imports).
- TypeScript with strict type safety.
- Component architecture and reusability.
- Pinia for application state management, only when state actually needs to be shared or persisted across components.
- Separation of concerns between presentation, logic, and data access.
- Maintainable, scalable code.
- Composables for shared reactive logic; components stay focused on presentation.

## Rules

- Prefer simple, maintainable solutions over clever ones.
- Avoid unnecessary abstractions - don't introduce a pattern until it's needed twice.
- Keep components focused and reusable; split components that take on multiple responsibilities.
- Do not put business logic directly inside presentation components - extract it into composables or services.
- Follow Nuxt 4 directory and routing conventions (`app/`, `pages/`, `components/`, `composables/`, etc.).
- Avoid hardcoded values that should be configuration or constants.
