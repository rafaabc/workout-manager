import { createTestDatabase, clearTestDatabase } from '../integration/testDatabase.js';
import { scryptSync, randomBytes, randomInt } from 'node:crypto';
import UserRepository from '../../src/repositories/userRepository.js';
import WorkoutRepository from '../../src/repositories/workoutRepository.js';
import GoalRepository from '../../src/repositories/goalRepository.js';
import { setUserRepository } from '../../src/services/userService.js';
import { setWorkoutRepositories } from '../../src/services/workoutService.js';
import { setMetricsRepositories } from '../../src/services/metricsService.js';

let db;
let userRepository;
let workoutRepository;
let goalRepository;

/**
 * Initializes an in-memory SQLite database and wires repositories into services.
 * Call once before test suites (e.g. in a top-level before hook).
 */
export function initTestDatabase() {
  db = createTestDatabase();
  userRepository = new UserRepository(db);
  workoutRepository = new WorkoutRepository(db);
  goalRepository = new GoalRepository(db);
  setUserRepository(userRepository);
  setWorkoutRepositories(workoutRepository, userRepository);
  setMetricsRepositories(userRepository, workoutRepository, goalRepository);
  return db;
}

/**
 * Resets the in-memory database to a clean state.
 * Call this before each test suite to guarantee isolation.
 */
export function resetDatabase() {
  if (!db) initTestDatabase();
  clearTestDatabase(db);
}

/**
 * Seeds a user directly in the database.
 * Returns the created user row.
 */
export function seedUser(username = 'testuser', password = 'Test1234', goal = 0) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  const passwordHash = `${salt}:${hash}`;
  const user = userRepository.createUser(username, passwordHash);
  if (goal > 0) {
    goalRepository.setGoal(user.id, goal);
  }
  return user;
}

/**
 * Seeds a workout entry directly in the database.
 */
export function seedWorkout(username, day, month, year) {
  const user = userRepository.findUserByUsername(username);
  if (!user) throw new Error(`User '${username}' not found. Seed the user first.`);
  workoutRepository.createWorkout(user.id, day, month, year);
}

/**
 * Generates a unique username for test isolation.
 */
export function uniqueUsername(prefix = 'user') {
  return `${prefix}_${randomBytes(4).toString('hex')}`;
}

/**
 * Returns a valid password that passes business rules (8+ chars, letters + numbers).
 */
export function validPassword() {
  return 'Test' + randomInt(100000) + 'Aa';
}
