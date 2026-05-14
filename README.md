# Team Dashboard Hub

A bilingual (Arabic/English) full-stack dashboard platform with GASTAT branding, KPI tracking, week-over-week analytics, AI-powered indicator suggestions, and a template library.

## Tech Stack

- **Backend**: FastAPI 0.110+, SQLAlchemy 2.x, Alembic, JWT auth, SQLite (local) / PostgreSQL (Railway)
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts + framer-motion + react-grid-layout
- **Default Theme**: GASTAT Executive (dark, Arabic-first, glass morphism)

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./data/app.db` | Database connection URL |
| `JWT_SECRET` | `change-me-in-production-secret-key-32chars` | JWT signing secret |
| `ADMIN_EMAIL` | `admin@example.com` | Initial admin account |
| `ADMIN_PASSWORD` | `changeme` | Initial admin password |
| `PUBLIC_BASE_URL` | `http://localhost:8000` | Public URL for cover generation |
| `WEEK_STARTS_ON` | `monday` | Week start day (monday/sunday) |
| `BIG_MOVE_THRESHOLD_PCT` | `10.0` | % threshold for "big move" alerts |
| `DEFAULT_THEME` | `gastat_executive` | Default theme slug |
| `ANTHROPIC_API_KEY` | _(optional)_ | Enable Claude-powered AI suggestions |
| `OPENAI_API_KEY` | _(optional)_ | Enable GPT-powered AI suggestions |
| `AI_SUGGESTER_PROVIDER` | `auto` | `auto` \| `anthropic` \| `openai` \| `rules` |

## Local Development

### Backend (PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
$env:DATABASE_URL = "sqlite:///./data/app.db"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "changeme"
uvicorn app.main:app --reload --port 8000
```

### Backend (Bash)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=sqlite:///./data/app.db \
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=changeme \
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, proxies `/api` to backend.

## Seeded Data

On first boot, the system automatically creates:
- Admin user (from `ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- 8 preset themes (GASTAT Executive, Executive Light, Midnight Pro, Glass Aurora, Terminal, Pastel Soft, High Contrast, Brand Blank)
- 5 official templates: Executive Weekly Review, Sales Pipeline Pulse, Marketing Acquisition, Ops Health Dashboard, Product Analytics

## Import GASTAT HTML

```bash
curl -X POST http://localhost:8000/dashboards/{id}/seed-from-html \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@input/dashboard.html"
```

## Docker

```bash
docker build -t team-dashboard-hub .
docker run -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./data/app.db \
  -e JWT_SECRET=your-secret \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=changeme \
  -v $(pwd)/data:/app/data \
  team-dashboard-hub
```

## Deploy to Railway

1. Push to GitHub
2. Create new Railway project from GitHub repo
3. Set environment variables (see table above)
4. Railway detects `railway.json` and builds with `Dockerfile`
5. Set `DATABASE_URL` to Railway PostgreSQL connection string

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive Swagger UI.

## Key Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/auth/login` | Get JWT token |
| GET | `/dashboards` | List dashboards |
| POST | `/dashboards/{id}/seed-from-html` | Import HTML dashboard |
| GET | `/templates` | List templates |
| POST | `/templates/{id}/clone` | Clone template to dashboard |
| GET | `/deltas/{dashboard_id}` | Week-over-week deltas |
| GET | `/ai/suggest/indicators/{dashboard_id}` | AI indicator suggestions |
| POST | `/ai/suggest/apply` | Apply AI suggestions |
| GET | `/exports/{id}/{pdf|pptx|html}` | Export dashboard |

## Architecture

```
team-dashboard-hub/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, lifespan, SPA fallback
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # JWT authentication
│   │   ├── config.py         # Settings via pydantic-settings
│   │   ├── seed_data.py      # Startup seeding
│   │   ├── week_utils.py     # WoW calculations
│   │   ├── indicator_registry.py  # 20 indicator types
│   │   ├── theme_registry.py # 8 preset themes
│   │   ├── routers/          # 14 API routers
│   │   └── services/         # 9 business services
│   ├── alembic/              # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # 12 React pages
│   │   ├── components/       # 20+ shared components
│   │   │   └── indicators/   # 20 indicator components
│   │   ├── hooks/            # 6 custom hooks
│   │   ├── api/              # 8 API client modules
│   │   ├── theme/            # ThemeProvider + CSS tokens
│   │   └── i18n/             # AR + EN translations
│   ├── package.json
│   └── vite.config.js
├── input/
│   ├── dashboard.html        # GASTAT source HTML
│   └── GASTAT_Template_General_EN.{pdf,pptx}
├── Dockerfile                # Multi-stage build
├── railway.json              # Railway deployment config
└── .gitignore
```
