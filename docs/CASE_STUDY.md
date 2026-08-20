# ExcelAI Academy — Portfolio Case Study

## 1. The Challenge

Excel learners often have access to disconnected tutorials, exercises, and career advice. The learning path can become difficult to follow because there is no clear progression from fundamentals to practical analysis.

The project goal was to create a single learning environment that makes progression visible, gives learners opportunities to practice, and creates a meaningful transition from Excel learning into Data Analyst preparation.

## 2. Product Direction

The solution was designed around four principles:

1. **Learn** — structured lessons from beginner through advanced Excel.
2. **Practice** — short knowledge checks and realistic datasets.
3. **Track** — save lesson completion and show progress.
4. **Unlock** — reward progression by revealing the Data Analyst pathway after the Excel Intermediate milestone.

## 3. Experience Design

The interface uses a dark, red-accented visual identity inspired by a Samurai dojo. The theme supports the product's progression concept without requiring heavy media assets.

The startup experience now uses a lightweight CSS animation rather than video. This was a deliberate reliability decision after video autoplay/overlay issues: the application no longer depends on Garp.mp4 or Zoro.mp4.

The opening message is:

**Welcome**

**Start your learning here**

The Data Analyst milestone uses an achievement overlay with the message:

**Congratulations You Have Unlock New Achievement**

## 4. Functional Architecture

The application is split into a browser frontend and Node.js API layer. Course content, modules, lessons, quizzes, datasets, search, authentication, and progress are exposed through API endpoints.

PostgreSQL is supported for persistent storage. A local in-memory data mode makes the project easier to demonstrate without requiring a database service.

## 5. Key Technical Decisions

### Conditional course unlocking

The Data Analyst course is not simply displayed as another course. The frontend and backend both enforce the progression requirement, reducing the chance that a hidden course is exposed only through a UI trick.

### Local fallback

A local data layer provides a useful development/demo path when `DATABASE_URL` is not configured. This reduces setup friction when presenting the project.

### Video removal

The original media-driven intro created reliability risks around autoplay, playback, and full-screen overlays. The portfolio build removes those dependencies and replaces them with CSS-based motion.

## 6. What the Project Demonstrates

- Full-stack web application structure
- UX/product thinking
- Progressive learning design
- JavaScript state management
- REST API integration
- Authentication and authorization
- PostgreSQL data modeling
- SQL migrations and seed data
- Responsive CSS
- Achievement and conditional-access logic
- Practical trade-off decisions for reliability

## 7. Future Roadmap

### Near term
- Add automated frontend/API tests.
- Expand dataset challenges with upload and validation.
- Add richer progress analytics.

### Product scale
- Add server-side AI tutoring.
- Introduce background processing for large datasets.
- Store course assets in object storage.
- Add CI/CD and deployment monitoring.

### Career layer
- Add portfolio-project milestones.
- Add downloadable learner certificates.
- Add capstone assessments and job-readiness tracking.
