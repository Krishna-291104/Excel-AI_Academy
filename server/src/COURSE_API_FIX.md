# ExcelAI Academy – Course API Fix

This build adds the PostgreSQL production route:

`GET /api/v1/courses/:slug`

The route loads the requested course, its modules, and their lessons so the
existing frontend course-opening flow can work in production.

It also enables PostgreSQL SSL in production when the server uses a Pool
configuration and SSL was not already configured.

## Render

Use the existing build/start commands from the project. After deploying,
check the Render logs and test:

`/api/v1/courses`

and then a real course slug, for example:

`/api/v1/courses/<course-slug>`
