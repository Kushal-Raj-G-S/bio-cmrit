# BioBloom

BioBloom is an AI-driven agriculture platform designed to help farms make faster, smarter decisions using data, simulation, and intuitive interfaces.

It combines a modern web frontend, a FastAPI backend, and domain-focused workflows for crop planning, field monitoring, irrigation strategy, and pest-management support.

## Why BioBloom

Agriculture teams often work across fragmented tools and delayed reporting. BioBloom centralizes key operations into one platform so teams can:

- visualize farm and operational context quickly
- run planning workflows with lower manual overhead
- prioritize support and actions with clearer insights
- scale analysis from small pilots to large datasets

## Repository Structure

- `landing_page/`: frontend application and user-facing product flows
- `main_backend/`: backend APIs, services, and business logic

## Core Capabilities

- AI-assisted crop planning and operational recommendations
- data-backed irrigation and pest-management workflows
- scalable ingestion and processing pipelines for production data
- role-oriented dashboards for monitoring and prioritization

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- Data layer: PostgreSQL/Supabase (module-specific)

## Getting Started

### 1) Prerequisites

- Node.js 18+
- Python 3.10+
- npm (or pnpm)

### 2) Run Frontend

```powershell
cd landing_page
npm install
npm run dev
```

### 3) Run Backend

```powershell
cd main_backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Recommended Development Flow

1. Start backend services first.
2. Start frontend app and verify API connectivity.
3. Use module-level README/setup docs for deeper local configuration.

## Documentation Notes

- Additional setup and feature details are available in module-level README files.
- Some folders may include environment-specific scripts and migration utilities.

## Project Status

Active development.

## License

Proprietary (unless explicitly stated otherwise in a module-specific license file).
