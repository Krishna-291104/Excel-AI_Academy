# ExcelAI Academy — local setup

## 1. Requirements
- Node.js 20+
- Docker Desktop (recommended for PostgreSQL)

## 2. Install
    npm install

## 3. Start PostgreSQL
    docker compose up -d postgres

## 4. Configure environment
Copy `.env.example` to `.env` and keep the local values unless you need different settings.

## 5. Migrate
    npm run db:migrate

## 6. Start
    npm start

Open:
    http://localhost:4000

The frontend and API are served from the same origin in this production-oriented build.

## Test
    npm run check

## What works in this version
- Course catalogue from PostgreSQL
- Dataset catalogue from PostgreSQL
- Search API
- User registration
- User login
- Password hashing with Node scrypt
- Signed authentication token
- Authenticated profile
- Authenticated lesson progress
- Bookmarks API
- Analytics event API
- Responsive learning UI
- Lesson viewer
- Practice UI
- Roadmap
- Formula helper
- API health endpoint

## Next backend modules
1. Course detail API
2. Quiz persistence/scoring
3. Notes
4. Dataset file upload/storage
5. Data profiling/cleaning worker
6. AI provider integration
7. Admin CMS
8. Email verification/password reset
9. OAuth
10. Rate limiting and abuse protection

## Production security requirements
- Replace JWT secret.
- Use HTTPS.
- Set secure cookies/token storage strategy.
- Add CSRF protection if cookie auth is used.
- Add rate limiting.
- Add input validation.
- Add upload scanning and file limits.
- Do not expose AI keys in frontend code.
- Add security headers/CSP.
- Add monitoring and backups.
