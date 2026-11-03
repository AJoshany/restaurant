# AGENTS.md

## Project Context

- Nuxt 4
- Vue 3 (Composition API)
- TypeScript
- npm

## General Development Rules

- Follow official Nuxt 4 conventions.
- Use TypeScript everywhere.
- Prefer clean, readable, maintainable code.
- Avoid unnecessary dependencies.
- Avoid premature abstractions.
- Keep responsibilities separated (presentation, logic, data access).
- Do not introduce hardcoded business values unnecessarily - use configuration or constants.

## Agent Workflow

For every future development task, follow this workflow:

1. **Analyze** - Understand the task and inspect relevant files.
2. **Plan** - Define the implementation approach and affected files.
3. **Implement** - Make only the changes required by the approved plan.
4. **Validate** - Run relevant checks and tests.
5. **Review** - Evaluate architecture, code quality, and regressions.
6. **Report** - Summarize changes, decisions, and validation results.
7. **Wait for Approval** - Do not start the next development phase until explicitly approved.

## Skill Usage

Use the relevant project skill (`.claude/skills/`) whenever a task falls within its responsibilities:

- UI/UX and visual decisions → `product-design`
- Vue/Nuxt implementation → `frontend-engineering`
- API and persistence → `backend-data-engineering`
- Testing → `quality-assurance`
- Independent code review → `code-review`
