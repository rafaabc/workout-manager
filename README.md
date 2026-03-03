[![CI - API Tests](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml/badge.svg)](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml)

# Workout Manager

A full-stack workout tracking application for managing workouts, user authentication, scheduling workouts on the calendar, and metrics.

This project is composed of a REST API backend and a browser-based frontend client communicating via HTTP and JWT authentication.

## Technologies

### Backend
- Node.js
- Express
- JWT (authentication)
- Swagger (documentation)

### Frontend
- HTML
- CSS
- JavaScript (ES6)

### Testing
- Mocha
- Chai
- Supertest
- k6

## Architecture

### Backend
- `src/routes`: API routes
- `src/controllers`: Endpoint logic
- `src/services`: Business rules
- `src/models`: Models and in-memory database
- `src/middleware`: Middlewares (e.g., authentication)
- `resources/swagger.json`: Swagger documentation

### Frontend
- `frontend/src/pages/`: Page templates (HTML)
- `frontend/src/components/`: Calendar, metrics, header components
- `frontend/src/services/`: API and authentication services
- `frontend/src/utils/`: Constants and validation helpers
- `frontend/src/styles/`: CSS stylesheets

### Testing
- `test/`: API tests (Mocha, Chai, Supertest)
- `performance/k6/`: Performance test scripts

## How to run (Backend API)
1. Install dependencies:
   ```bash
   npm install
   ```
   For performance tests, install k6 globally:
   ```bash
   npm install -g k6
   ```
2. Run quality checks (lint, format, audit):
   ```bash
   npm run lint        # static analysis with ESLint + security rules
   npm run lint:fix    # auto-fix ESLint issues
   npm run format      # auto-format code with Prettier
   npm run audit       # check dependency vulnerabilities
   ```
3. Start the API:
   ```bash
   npm start    # or `node src/app.js`
   ```
4. Access the documentation:
   ```
   http://localhost:3000/api-docs
   ```

### Code Quality Tools
This project uses several tools to maintain code quality:
- **ESLint** – Static analysis with security rules (`eslint.config.js`)
- **Prettier** – Automatic code formatting (`.prettierrc`)
- **Husky + lint-staged** – Git hooks to lint & format before commits (`.husky/`)
- **npm audit** – Dependency vulnerability scanning

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs all checks automatically on push/PR.

## Main Endpoints
- `POST /api/users/register` — User registration
- `POST /api/users/login` — Login (returns JWT)
- `POST /api/users/logout` — Logout
- `GET /api/workouts/calendar?month=<number>&year=<number>` — List workouts for given month/year
- `POST /api/workouts/calendar` — Schedule workout `{ day, month, year }`
- `DELETE /api/workouts/calendar` — Unschedule workout `{ day, month, year }`
- `GET /api/metrics` — User metrics
- `POST /api/metrics/goal` — Set annual goal `{ goal }`

See details and examples in Swagger.

## Frontend Web Application
The frontend lives under `frontend/`. It is built with plain HTML, CSS and ES6
JavaScript and consumes the API endpoints listed above. No build step is required;
you can open `frontend/index.html` directly or serve the folder with a lightweight
HTTP server (`http-server`, Python `http.server`, etc.).

The frontend is intentionally framework-free to keep the project lightweight and
focused on understanding core web concepts such as API consumption, authentication
handling and state synchronization.

The frontend features authentication pages, a calendar component and a metrics
dashboard. See the source files for additional details.

## Tests

### API Tests
API tests are located in the `test/` folder. To run them, use:
```
npm test
```
They cover main endpoints, business rules, and validations.

### Performance Tests (k6)
Performance tests use k6. Install k6 globally (`npm install -g k6`).
Scripts live under `performance/k6/`. Run one via:
```
npm run k6:register
```
These are for local use and not executed in CI.

## Features and Business Rules

### 1) User Registration and Login
As an application user, I want to log in with a username and password so that I can securely access and manage my workouts throughout the year.

- The system must allow registration of a new user with username and password.
- There must be no duplicate usernames in the system.
- The password must contain at least 8 characters, including letters and numbers.
- The system must validate username and password at login.
- The system must deny access if the credentials are incorrect.
- The authenticated user must remain logged in until they log out or end the session.
- The system must allow logout at any time.

### 2) Scheduling Workouts on the Calendar
As an authenticated user, I want to mark on the calendar the days I worked out so that I can track my attendance throughout the year.

- The user must be authenticated to access the calendar.
- The calendar must display the current month, with the option to navigate to the previous and next months.
- By clicking on a day, the system must allow marking or unmarking the workout performed.
- A marked day must be visually highlighted (e.g., green color).
- The system must allow only one workout record per day per user.
- The system must save the workout record linked to the logged-in user.
- The system must persist the data even after logout.

### 3) Planned vs. Completed Workouts Metrics
As an authenticated user, I want to view metrics comparing the number of planned workouts with those completed so that I can track my performance throughout the year.

- The system must allow setting an annual workout goal (e.g., 200 workouts).
- The system must automatically calculate the total number of workouts completed in the month and year.
- The system must display the percentage of workouts completed in relation to the annual goal.
- The system must display the total workouts completed in the current month.
- The system must update the metrics automatically when marking or unmarking a workout.
- The metrics must consider only the workouts of the authenticated user.

## License
This project is licensed under the [MIT License](LICENSE).

© 2026 rafaabc
