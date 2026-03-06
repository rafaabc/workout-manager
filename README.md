[![Code Quality](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml/badge.svg?event=push)](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml)
[![Unit Tests](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml/badge.svg?event=push)](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml)
[![API Tests](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml/badge.svg?event=push)](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml)

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
- Jest
- jsdom
- c8
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
- `test/api/`: API tests (Mocha, Chai, Supertest)
- `test/unit/`: Unit tests (Node.js Test Runner)
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

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs all checks automatically on push/PR in three stages:
1. **Code Quality** — lint, format check, dependency audit
2. **Unit Tests** — backend and frontend unit tests with coverage
3. **API Tests** — starts the server and runs integration tests

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
API tests are located in `test/api/`. To run them, use:
```
npm test
```
They cover main endpoints, business rules, and validations.

### Unit Tests
Unit tests validate the internal business logic of the application in isolation, covering the **services**, **models** and **utils** layers. They are written using the **Node.js native test runner** (`node:test`) and the built-in `assert` module — no external test frameworks are required.

#### Structure
```
test/
  api/                       # API / integration tests (Mocha + Chai + Supertest)
    testUtils.js
    calendar/
    login/
    metrics/
  unit/                      # Unit tests (Node.js Test Runner + assert)
    testHelper.js
    services/
      userService.test.js
      workoutService.test.js
      metricsService.test.js
    models/
      db.test.js
    utils/
      validators.test.js
```

#### Running unit tests
```bash
npm run test:backend:unit
```

#### Running unit tests with code coverage
```bash
npm run test:backend:unit:coverage
```
Coverage is generated by **c8** and printed to the terminal. An HTML report is written to the `coverage/` directory.

### Frontend Unit Tests

Frontend unit tests validate the client-side logic in isolation, covering **services**, **components** and **utils** layers. They are written using **Jest** with a **jsdom** environment to simulate browser behavior in Node.js.

#### Objective
Ensure correctness of UI logic, input validation, API service integration, calendar navigation and metrics calculations without making real API calls.

#### Stack
- **Jest** — test runner, assertions and mocks
- **jsdom** — DOM simulation for component rendering
- **c8** — code coverage (statements, branches, functions, lines)
- **Babel** — ES6 module transpilation for Node.js

#### Structure
```
frontend/
  test/
    unit/
      services/
        api.test.js            # ApiService + AuthService tests
      components/
        calendar.test.js       # Calendar component tests
        metrics.test.js        # Metrics component tests
      utils/
        validators.test.js     # Input validation tests
```

#### Running frontend tests
```bash
npm run test:frontend:unit
```

#### Running frontend tests with code coverage
```bash
npm run test:frontend:unit:coverage
```
Coverage is generated by **c8** and printed to the terminal.

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
