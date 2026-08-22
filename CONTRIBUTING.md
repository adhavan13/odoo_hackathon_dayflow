# Contributing to DayFlow

This guide covers everything you need to know to contribute to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [API Documentation Rule](#api-documentation-rule)
- [Getting Help](#getting-help)

---

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Ways to Contribute

| Contribution type | How |
|---|---|
| Bug report | [Open an issue](https://github.com/adhavan13/odoo_hackathon_dayflow/issues/new?template=bug_report.md) |
| Feature request | [Open an issue](https://github.com/adhavan13/odoo_hackathon_dayflow/issues/new?template=feature_request.md) |
| Documentation fix | Edit any `.md` file and open a PR |
| Write tests | Pick any untested module and add coverage |
| Code review | Review open pull requests |

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork via the GitHub UI, then:
git clone https://github.com/<your-username>/odoo_hackathon_dayflow.git
cd odoo_hackathon_dayflow

git remote add upstream https://github.com/adhavan13/odoo_hackathon_dayflow.git
```

### 2. Backend

```bash
cd Backend
npm install
cp .env.example .env
# Fill in your .env values (see README.md)
npm run dev
```

Backend runs at `http://localhost:4000`.

### 3. Frontend

```bash
cd Frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 4. Keep Your Fork in Sync

```bash
git fetch upstream
git checkout dev
git merge upstream/dev
```

---

## Branching Strategy

```
main       production releases only (protected, no direct pushes)
  └── dev  integration branch — all PRs must target this branch
```

Branch naming:

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes only |
| `chore/` | Tooling, dependencies, refactoring |
| `hotfix/` | Critical production fixes |

Use kebab-case after the prefix. Examples:

```bash
git checkout -b feat/holiday-calendar
git checkout -b fix/attendance-timezone-bug
git checkout -b docs/api-leave-module
```

Never push directly to `main` or `dev`.

---

## Commit Convention

DayFlow uses [Conventional Commits](https://www.conventionalcommits.org/).

Format:
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructuring without feature change or bug fix |
| `test` | Adding or updating tests |
| `chore` | Build system, dependency updates |
| `perf` | Performance improvements |
| `ci` | CI/CD pipeline changes |

### Scopes

Use the module name: `auth`, `attendance`, `leave`, `payroll`, `employee`, `ai-assistant`, `announcement`, `frontend`, `backend`, `docs`.

### Examples

```
feat(payroll): add bonus component to salary structure
fix(attendance): correct timezone offset on check-in
docs(api): document announcement endpoints
chore(deps): bump next.js to 16.3.2
refactor(auth): extract token validation to utility
```

PRs with non-conventional commit messages will be asked to squash or rewrite before merge.

---

## Pull Request Process

### Before Opening a PR

- [ ] Your branch is up to date with `upstream/dev`
- [ ] No `console.log` debug statements in production code
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] API changes are documented in `Backend/README.md` in the same PR
- [ ] New features include an entry in `CHANGELOG.md`

### PR Title

Follow Conventional Commits format:

```
feat(leave): add maternity leave approval notifications
fix(frontend): resolve hydration mismatch in AppHeader
```

### PR Description

Fill out the provided pull request template. Required fields:

- What this PR does
- Why the change is needed
- How it was tested
- Screenshots for any UI changes
- Whether there are breaking changes
- Related issue numbers (`Closes #123`)

### Review Process

1. A maintainer will review within **3 business days**.
2. Address all requested changes by pushing new commits to the same branch.
3. Once approved by at least one maintainer, the PR is merged via **Squash and Merge**.

---

## Coding Standards

### General

- Use TypeScript throughout — avoid `any` without explicit justification and a comment
- Keep functions small and focused to a single responsibility
- Add comments only for non-obvious logic; write self-documenting code otherwise
- Remove all unused imports and variables before submitting

### Backend (Express / Node.js)

- All business logic goes in controllers or services — no inline logic in route files
- Use Zod schemas for all request validation
- Always use the standard response envelope — no raw `res.json({})` calls
- Handle async errors with `try/catch` or pass to `next(err)`
- Every new or changed endpoint must be documented in `Backend/README.md` in the same PR

### Frontend (Next.js / React)

- Use functional components with hooks — no class components
- Use Zustand stores for global state; use `useState` for local component state
- Default to React Server Components; add `"use client"` only when required (event handlers, browser APIs, React hooks)
- All forms must use React Hook Form with Zod validation
- Use Radix UI primitives via `components/ui/` for interactive elements — do not add competing UI component libraries
- Avoid inline styles; use Tailwind CSS utility classes

### TypeScript

- Prefer `interface` for object shapes; use `type` for unions and intersections
- Strict mode is already enabled in `tsconfig.json`
- Explicitly type return values for all exported functions
- Do not use `@ts-ignore` without a comment explaining why

---

## Reporting Bugs

Search [existing issues](https://github.com/adhavan13/odoo_hackathon_dayflow/issues) before opening a new one.

A good bug report includes:

1. OS, Node.js version, and browser
2. Exact steps to reproduce
3. Expected behavior
4. Actual behavior, including any error messages or stack traces
5. Screenshots if the issue is visual
6. A minimal reproduction if possible

[Open a Bug Report](https://github.com/adhavan13/odoo_hackathon_dayflow/issues/new?template=bug_report.md)

---

## Requesting Features

To help us evaluate a feature request:

1. Describe the problem you are trying to solve (not just the solution)
2. Describe your proposed solution in detail
3. List alternatives you considered
4. Explain how many users this would affect and whether it is blocking a real use case

[Open a Feature Request](https://github.com/adhavan13/odoo_hackathon_dayflow/issues/new?template=feature_request.md)

---

## API Documentation Rule

Every new API endpoint or change to an existing endpoint **must** be documented in `Backend/README.md` in the same PR.

Documentation must include:

- HTTP method and full route path
- Authentication requirement and required roles
- Query parameters and path parameters
- Request `Content-Type`
- Complete request body example
- Success response example
- All error responses and their status codes
- Any required environment variable, database, or setup changes

PRs that add or modify endpoints without updating the documentation will not be merged.

---

## Getting Help

- **GitHub Discussions** — general questions and ideas
- **GitHub Issues** — bugs and feature requests only
- **README.md** — project setup and overview
- **Backend/README.md** — full API reference

When asking for help, include what you were trying to do, what you tried, and the error or unexpected behavior you observed.
