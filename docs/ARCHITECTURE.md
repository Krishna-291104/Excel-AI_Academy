# Architecture

```text
Browser
  │
  ▼
HTML / CSS / JavaScript frontend
  │
  ▼
Node.js HTTP API
  ├── Auth
  ├── Courses / modules / lessons
  ├── Quizzes
  ├── Search
  └── Learner progress
  │
  ▼
PostgreSQL (persistent mode)
       │
       └── Local in-memory fallback for demos
```

## Security boundary

The browser communicates with the application API. Provider credentials/secrets are intended to remain server-side.

## Progression boundary

The Data Analyst course is protected by the Excel Intermediate milestone. The application checks the requirement before allowing the course to be opened.

## Media strategy

The portfolio build intentionally contains no Garp.mp4 or Zoro.mp4 assets and no video-based intro dependency. The startup experience is CSS-based, reducing autoplay and overlay reliability issues.

## Future production components

- Redis for caching/rate limits/jobs
- Object storage for XLSX/CSV/media assets
- Search service such as Meilisearch/OpenSearch
- Server-side AI provider integration
- Background workers for large dataset processing
