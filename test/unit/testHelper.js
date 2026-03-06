import { users, workouts } from '../../src/models/db.js';

/**
 * Resets the in-memory database to a clean state.
 * Call this before each test suite to guarantee isolation.
 */
export function resetDatabase() {
  // Remove all dynamic keys
  for (const key of Object.keys(users)) {
    delete users[key];
  }
  for (const key of Object.keys(workouts)) {
    delete workouts[key];
  }
}

/**
 * Seeds a user directly in the in-memory database.
 * Returns the created user object.
 */
export function seedUser(username = 'testuser', password = 'Test1234', goal = 0) {
  users[username] = { username, password, goal };
  workouts[username] = [];
  return users[username];
}

/**
 * Seeds a workout entry directly in the in-memory database.
 */
export function seedWorkout(username, day, month, year) {
  if (!workouts[username]) workouts[username] = [];
  workouts[username].push({ day, month, year });
}

/**
 * Generates a unique username for test isolation.
 */
export function uniqueUsername(prefix = 'user') {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}
