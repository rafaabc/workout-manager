
[![CI - API Tests](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml/badge.svg)](https://github.com/rafaabc/gestao-treinos-academia/actions/workflows/ci.yml)

# API Workout Manager

REST API for managing workouts, user authentication, scheduling workouts on the calendar, and metrics.

## Technologies
- Node.js
- Express
- JWT (authentication)
- Swagger (documentation)

## Architecture
- **src/routes**: API routes
- **src/controllers**: Endpoint logic
- **src/services**: Business rules
- **src/models**: Models and in-memory database
- **src/middleware**: Middlewares (e.g., authentication)
- **resources/swagger.json**: Swagger documentation
- **performance/**: Performance test scripts (k6)
- **test/**: API tests scripts (Mocha, Chai, Supertest)

## How to run
1. Install dependencies:
	- `npm install`
	- For performance tests, install k6 globally: `npm install -g k6`
2. Start the API:
	- `npm start` (or `node src/app.js`)
3. Access the documentation: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
4. Run the tests:
	- API tests: `npm test`
	- Performance tests: `npm run k6:register`
## Tests

### API Tests
API tests are located in the `test/` folder. To run them, use:
```
npm test
```
The tests cover main endpoints, business rules, and validations.

### Performance Tests (k6)
Performance tests use k6. Install k6 globally (`npm install -g k6`).
The scripts are in `performance/k6/`. To run a performance test, execute:
```
npm run k6:register
```
These tests are intended for local execution only and are not automatically run in the CI/CD pipeline.

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

## Features and Business Rules

### 1) User Registration and Login

User Story
As an application user, I want to log in with a username and password so that I can securely access and manage my workouts throughout the year.

Business Rules
- The system must allow registration of a new user with username and password.
- There must be no duplicate usernames in the system.
- The password must contain at least 8 characters, including letters and numbers.
- The system must validate username and password at login.
- The system must deny access if the credentials are incorrect.
- The authenticated user must remain logged in until they log out or end the session.
- The system must allow logout at any time.


### 2) Scheduling Workouts on the Calendar

User Story
As an authenticated user, I want to mark on the calendar the days I worked out so that I can track my attendance throughout the year.

Business Rules
- The user must be authenticated to access the calendar.
- The calendar must display the current month, with the option to navigate to the previous and next months.
- By clicking on a day, the system must allow marking or unmarking the workout performed.
- A marked day must be visually highlighted (e.g., green color).
- The system must allow only one workout record per day per user.
- The system must save the workout record linked to the logged-in user.
- The system must persist the data even after logout.


### 3) Planned vs. Completed Workouts Metrics

User Story
As an authenticated user, I want to view metrics comparing the number of planned workouts with those completed so that I can track my performance throughout the year.

Business Rules
- The system must allow setting an annual workout goal (e.g., 200 workouts).
- The system must automatically calculate the total number of workouts completed in the month and year.
- The system must display the percentage of workouts completed in relation to the annual goal.
- The system must display the total workouts completed in the current month.
- The system must update the metrics automatically when marking or unmarking a workout.
- The metrics must consider only the workouts of the authenticated user.