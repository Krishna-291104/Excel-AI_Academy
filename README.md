# ExcelAI Academy — Interactive Excel & Data Analytics Learning Platform

> A portfolio-ready learning platform that takes learners from Excel fundamentals to data-analyst skills through structured lessons, practical datasets, quizzes, progress tracking, and achievement-based course unlocking.

## Project Overview

ExcelAI Academy is a full-stack educational web application built around a progressive learning journey. The experience combines curriculum structure, hands-on practice, learner progress, authentication, and a hidden Data Analyst pathway that becomes available after the learner completes the defined Excel Intermediate milestone.

The interface uses a dark, red-accented Samurai-inspired visual language while keeping the actual learning experience clean and accessible.

## Product Highlights

- **Progressive Excel curriculum** — beginner, intermediate, and advanced learning paths.
- **Lesson experience** — objectives, lesson content, duration, and knowledge checks.
- **Practice lab** — short-answer practice with immediate feedback.
- **Dataset library** — structured datasets for practical exercises.
- **Progress tracking** — authenticated users can save completed lessons.
- **Achievement system** — completing the Excel Intermediate requirement unlocks the hidden Data Analyst course.
- **Data Analyst roadmap** — staged progression across Excel, SQL, statistics, visualization, BI, Python, analytics, portfolio work, and job readiness.
- **Search** — searchable learning content and datasets through the API.
- **Formula assistant** — lightweight spreadsheet-formula guidance in the frontend.
- **Local development fallback** — the app can run without PostgreSQL for quick demonstrations.
- **PostgreSQL support** — persistent account/progress storage when `DATABASE_URL` is configured.
- **Responsive UI** — desktop and mobile layouts.
- **Video-free startup** — the current portfolio build does not depend on Garp.mp4, Zoro.mp4, or any intro video, avoiding autoplay and overlay failures.

## Achievement Experience

The Data Analyst pathway is intentionally hidden behind an Excel Intermediate milestone.

**Requirement:** complete the `XLOOKUP` and `Pivot Tables` lessons while signed in.

When the milestone is reached, the application displays:

> **Congratulations You Have Unlock New Achievement**

The achievement panel then provides an option to enter the unlocked Data Analyst course.

## Tech Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript (ES modules)
- Responsive UI and lightweight CSS animation

**Backend**
- Node.js
- Native HTTP server
- REST-style API endpoints
- Authentication and progress APIs

**Data**
- PostgreSQL via `pg`
- SQL migrations and seed data
- In-memory/local fallback for demos

**Development**
- npm
- Docker Compose for optional PostgreSQL

## Architecture

```text
Browser
   │
   ▼
Static frontend (HTML/CSS/JS)
   │
   ▼
Node.js API
   │
   ├── Authentication
   ├── Courses / modules / lessons
   ├── Quizzes
   ├── Search
   └── Learner progress
   │
   ▼
PostgreSQL (optional for local demo; persistent mode in production)
```

The browser does not receive provider secrets. External AI/provider integrations are designed to be routed through the server.

## Run Locally

### Quick demo mode

```bash
npm install
npm start
```

Then open:

```text
http://localhost:4000
```

Do **not** open `web/index.html` directly with Live Server. The frontend expects the Node server to provide the API routes.

### PostgreSQL mode

Start PostgreSQL with Docker Compose:

```bash
docker compose up -d postgres
```

Copy the environment template:

```bash
cp .env.example .env
```

Then run migrations and start the server:

```bash
npm run db:migrate
npm start
```

On Windows PowerShell, copy `.env.example` to `.env` manually if the `cp` command is unavailable.

## Useful Commands

```bash
npm start          # production-style local server
npm run dev        # Node watch mode
npm run db:migrate # apply database migrations
npm run check      # project checks
```

## Project Structure

```text
.
├── web/
│   ├── index.html
│   └── src/
│       ├── app.js
│       ├── api.js
│       └── styles.css
├── server/
│   ├── migrations/
│   ├── scripts/
│   └── src/
│       ├── auth.js
│       ├── db.js
│       ├── local-data.js
│       └── server.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CASE_STUDY.md
│   ├── LINKEDIN.md
│   └── SETUP.md
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Portfolio Positioning

This project demonstrates more than frontend styling. It combines:

- product/learning experience design
- curriculum and progression logic
- responsive UI implementation
- REST API design
- authentication
- persistent progress architecture
- SQL migrations and seeded content
- achievement-based conditional access
- local-development resilience

See [`docs/CASE_STUDY.md`](docs/CASE_STUDY.md) for the portfolio narrative and [`docs/LINKEDIN.md`](docs/LINKEDIN.md) for ready-to-use LinkedIn copy.

## Current Scope & Future Improvements

The current build is intentionally lightweight and portfolio-friendly. Potential production extensions include:

- richer dataset upload/processing workflows
- real AI tutoring integration behind the server
- persistent achievement/event history
- automated tests and CI/CD
- object storage for large learning assets
- background workers for heavy data processing
- analytics dashboards for learner engagement

## License

See [`LICENSE`](LICENSE).
