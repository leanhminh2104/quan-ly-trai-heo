# Pig Farm Management System (PFMS)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fleanhminh2104%2Fquan-ly-trai-heo&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,DATABASE_URL,DIRECT_URL)
![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-beta-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

A comprehensive, production-ready SaaS platform for intelligent pig farm operations. Features multi-tenant architecture, Role-Based Access Control (RBAC), animal health tracking, inventory management, and financial reporting.

Built for **dalymmo.com** and **leanhminh.io.vn** by **LAMDev**.

## Language

- English (default): this file
- Vietnamese: [README-vn.md](./README-vn.md)

## Table of Contents

- [Version Details](#version-details)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Full Deployment on Vercel](#full-deployment-on-vercel)
- [Donate](#donate)
- [Contributing](#contributing)
- [Security](#security)
- [Support](#support)
- [Copyright and Credits](#copyright-and-credits)

## Version Details

| Field | Value |
| --- | --- |
| Application version | `0.1.0` |
| Release channel | `beta` |
| Main branch | `main` |
| Last documented update | `2026-07-03` |
| Changelog file | [CHANGELOG.md](./CHANGELOG.md) |

## Features

### Core Operations
- **Pig Tracking**: End-to-end lifecycle management from piglet to market.
- **Barn Management**: Interactive barn layout, zone monitoring, and capacity tracking.
- **Breeding Cycle**: Mating, ultrasound, farrowing, and weaning automation.
- **Health Management**: Vaccination schedules and treatment logging.
- **Inventory**: Feed, medicine, supply, and vaccine stock management.
- **Finance**: Cash flow, invoices, and comprehensive farm economy tracking.

### Security & Multi-tenancy
- **Multi-farm (SaaS)**: Strict data isolation utilizing `farmId` references.
- **RBAC**: Custom role matrix (Owner, Manager, Veterinarian, Worker).
- **Audit Logs**: Every mutation is logged for accountability.
- **Soft Deletes**: Preventing accidental business data loss.

## Architecture

```text
quan-ly-chuong-lon/
|- prisma/       # Database schema and migrations
|- src/
|  |- actions/   # Server actions (Next.js 15)
|  |- app/       # App router pages and layouts
|  |- components/# UI components (shadcn/ui + custom)
|  |- hooks/     # React custom hooks
|  |- lib/       # Core utilities (Auth, RBAC, DB client)
|  |- types/     # TypeScript definitions
|  |- validators/# Zod schemas for input validation
```

## Quick Start

### Prerequisites

- Node.js `18+` (20+ recommended)
- npm
- PostgreSQL database (Supabase recommended)

### Install

```bash
git clone https://github.com/leanhminh2104/quan-ly-trai-heo.git
cd quan-ly-trai-heo
npm install
```

### Database Setup

```bash
npx prisma db push
npx prisma generate
```

### Run Local

```bash
npm run dev
```

Default local URL: `http://localhost:3000`

## Environment Variables

Create `.env.local` (or `.env`) from the example file:

```bash
cp .env.example .env
```

Required variables:

```env
# Supabase Database URL (Transaction pooler for Vercel)
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Supabase Direct URL (for migrations)
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

## Full Deployment on Vercel

1. Push your code to GitHub.
2. Import repository in Vercel.
3. Add all required ENV variables in the Vercel dashboard.
4. Deploy project.
5. Setup complete. Vercel will automatically build the Next.js app and run Prisma generation.

## Donate

If this project helps your business, you can support ongoing maintenance.

| Method | Details |
| --- | --- |
| Bank | MB Bank |
| Account number | `2104200637` |
| Account holder | `LE VAN ANH MINH` |
| QR | ![MB QR](https://img.vietqr.io/image/MB-2104200637-qr_only.png) |

## Contributing

We welcome contributions from the community.

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.
- Keep changes focused and include clear descriptions.
- Update docs/changelog for user-visible changes.

## Security

For vulnerability reporting and response policy, see [SECURITY.md](./SECURITY.md).

## Support

- GitHub Issues: use issues for bugs and feature requests.
- Operational support: check your Vercel deployment logs first, then provide logs and reproduction steps.

## Copyright and Credits

- Copyright (c) 2026 **dalymmo.com** and **leanhminh.io.vn** - **LAMDev**
- Developed and maintained by **LAMDev**
- Official domains: **dalymmo.com** & **leanhminh.io.vn**

This repository is licensed under MIT. See [LICENSE](./LICENSE).
