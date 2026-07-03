# Contributing Guide

Thank you for your interest in contributing to the Pig Farm Management System (PFMS).

## Scope

This repository contains a production-focused web application for pig farm management, developed for dalymmo.com and leanhminh.io.vn.

Please keep changes practical, testable, and aligned with the current Next.js 15 App Router architecture.

## Before You Start

1. Read [README.md](./README.md) and [README-vn.md](./README-vn.md).
2. Check open issues and existing pull requests.
3. For large changes, open an issue first to discuss the approach.

## Development Setup

```bash
git clone https://github.com/leanhminh2104/quan-ly-trai-heo.git
cd quan-ly-trai-heo
npm install
npm run dev
```

## Branch and Commit Conventions

- Branch naming:
  - `feature/<short-name>`
  - `fix/<short-name>`
  - `docs/<short-name>`
- Commit message style:
  - Clear, imperative, and scoped where possible.
  - Example: `feat(pigs): add bulk import functionality`

## Pull Request Checklist

- Change is focused and minimal.
- Documentation updated (README/README-vn/CHANGELOG) when needed.
- No secrets included in diff (`.env`, keys, tokens).
- Code style is consistent with existing files (ESLint/Prettier).
- PR description includes:
  - What changed
  - Why it changed
  - How to test

## Documentation Policy

If behavior changes, update both:
- [README.md](./README.md) (English)
- [README-vn.md](./README-vn.md) (Vietnamese)

If release-facing changes are made, update:
- [CHANGELOG.md](./CHANGELOG.md)

## Security and Sensitive Data

- Never commit production secrets.
- Never commit raw customer data.
- Follow [SECURITY.md](./SECURITY.md) for vulnerability reporting.

## Review and Merge

- Maintainers may request changes before merge.
- High-risk production changes may require additional verification.
