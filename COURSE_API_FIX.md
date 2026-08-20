# Course API Fix

Added the PostgreSQL production endpoint:

GET /api/v1/courses/:slug

The endpoint uses the project's existing `query()` database helper and only
columns present in the project's schema:
- courses: id, slug, title, description, level, published
- modules: id, course_id, slug, title, order_index
- lessons: id, module_id, slug, title, level, duration_minutes, content, objectives, published, order_index

The backend JavaScript files were syntax-checked with Node.js before packaging.
