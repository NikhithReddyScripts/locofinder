# Locofinder Frontend

Next.js 14 (App Router) frontend for the Locofinder location-intelligence monorepo.

## Stack

| Tool | Purpose |
|------|---------|
| **Next.js 14** (App Router) | Framework |
| **TypeScript** | Type safety |
| **TailwindCSS** | Styling |
| **TanStack Query v5** | Server state & data fetching |
| **Zustand** | Client state (weights, filters) |
| **Zod** | Runtime API response validation |
| **react-leaflet + Leaflet** | Map view (OpenStreetMap tiles) |
| **Sonner** | Toast notifications |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Recommend workflow: set weights/filters → ranked results (list, table, map) |
| `/explore` | Paginated dataset browser |
| `/location/[id]` | Location detail + score explainability |
| `/status` | Backend & Redis health check |
| `/admin` | Reset dummy data (dev-only) |

## Local Development

### Prerequisites

- Node.js 20+
- Backend running on `http://localhost:8000` (see root `docker-compose.yml`)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local if backend is on a different URL
```

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker Compose (full stack)

From the **repo root**:

```bash
docker compose up --build
```

Services:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8000
- **Redis** → localhost:6379

> Note: The Docker image uses `next build` + `next start` (production mode).  
> The `NEXT_PUBLIC_API_BASE_URL` build arg defaults to `http://localhost:8000`.  
> For real deployments, override this to point to your backend.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Navbar, Providers)
│   ├── page.tsx            # / — Recommend workflow
│   ├── explore/page.tsx    # /explore — Dataset browser
│   ├── location/[id]/      # /location/[id] — Detail page
│   ├── status/page.tsx     # /status — Health check
│   └── admin/page.tsx      # /admin — Dev tools
├── components/
│   ├── ui/                 # Primitive components (Button, Badge, Skeleton, Input)
│   ├── FiltersPanel.tsx    # Weight sliders + filter inputs
│   ├── ResultsView.tsx     # Tab switcher: List | Table | Map
│   ├── LocationCard.tsx    # Card in list view
│   ├── RankingTable.tsx    # Table view of ranked results
│   ├── MapView.tsx         # Leaflet map (ssr:false)
│   ├── ScoreBreakdown.tsx  # Feature-level score explainability
│   ├── LocationDrawer.tsx  # Slide-in drawer with detail + breakdown
│   ├── Navbar.tsx          # Top navigation bar
│   └── WeightSlider.tsx    # Individual weight slider
├── hooks/                  # TanStack Query hooks
├── lib/
│   ├── api.ts              # Centralized API client
│   ├── schemas.ts          # Zod schemas for all API types
│   └── utils.ts            # Formatting helpers, cn(), US_STATES
└── store/
    └── filtersStore.ts     # Zustand store (weights, filters, bypassCache)
```

## Lint & Format

```bash
npm run lint      # ESLint
npm run format    # Prettier
```
