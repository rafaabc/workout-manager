import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase, clearTestDatabase } from '../../integration/testDatabase.js';
import UserRepository from '../../../src/repositories/userRepository.js';
import WorkoutRepository from '../../../src/repositories/workoutRepository.js';
import GoalRepository from '../../../src/repositories/goalRepository.js';

describe('SQLite Database (database layer)', () => {
  let db;
  let userRepo;
  let workoutRepo;
  let goalRepo;

  before(() => {
    db = createTestDatabase();
    userRepo = new UserRepository(db);
    workoutRepo = new WorkoutRepository(db);
    goalRepo = new GoalRepository(db);
  });

  beforeEach(() => {
    clearTestDatabase(db);
  });

  after(() => {
    db.close();
  });

  // ─── users store ───────────────────────────────────────────

  describe('users store', () => {
    it('should start empty after reset', () => {
      const user = userRepo.findUserByUsername('anyone');
      assert.strictEqual(user, undefined);
    });

    it('should store a user by username', () => {
      userRepo.createUser('alice', 'Pass1234');
      const user = userRepo.findUserByUsername('alice');
      assert.ok(user);
      assert.strictEqual(user.username, 'alice');
    });

    it('should allow multiple users', () => {
      userRepo.createUser('u1', 'Pass1234');
      userRepo.createUser('u2', 'Pass1234');
      const u1 = userRepo.findUserByUsername('u1');
      const u2 = userRepo.findUserByUsername('u2');
      assert.ok(u1);
      assert.ok(u2);
    });

    it('should return undefined for a non-existing user', () => {
      assert.strictEqual(userRepo.findUserByUsername('ghost'), undefined);
    });

    it('should enforce unique username constraint', () => {
      userRepo.createUser('unique', 'Pass1234');
      assert.throws(() => userRepo.createUser('unique', 'Other123'));
    });
  });

  // ─── workouts store ────────────────────────────────────────

  describe('workouts store', () => {
    it('should start empty after reset', () => {
      const user = userRepo.createUser('athlete', 'Pass1234');
      const workouts = workoutRepo.findWorkoutsByMonth(user.id, 1, 2026);
      assert.deepStrictEqual(workouts, []);
    });

    it('should store workouts per user', () => {
      const user = userRepo.createUser('athlete', 'Pass1234');
      workoutRepo.createWorkout(user.id, 1, 3, 2026);
      const workouts = workoutRepo.findWorkoutsByMonth(user.id, 3, 2026);
      assert.strictEqual(workouts.length, 1);
    });

    it('should keep workouts isolated between users', () => {
      const a = userRepo.createUser('a', 'Pass1234');
      const b = userRepo.createUser('b', 'Pass1234');
      workoutRepo.createWorkout(a.id, 1, 1, 2026);
      workoutRepo.createWorkout(b.id, 2, 2, 2026);
      workoutRepo.createWorkout(b.id, 3, 2, 2026);

      const aWorkouts = workoutRepo.findWorkoutsByMonth(a.id, 1, 2026);
      const bWorkouts = workoutRepo.findWorkoutsByMonth(b.id, 2, 2026);
      assert.strictEqual(aWorkouts.length, 1);
      assert.strictEqual(bWorkouts.length, 2);
    });

    it('should store workout entries with day, month, year', () => {
      const user = userRepo.createUser('athlete', 'Pass1234');
      workoutRepo.createWorkout(user.id, 15, 6, 2026);
      const w = workoutRepo.findWorkoutByDate(user.id, 15, 6, 2026);
      assert.strictEqual(w.day, 15);
      assert.strictEqual(w.month, 6);
      assert.strictEqual(w.year, 2026);
    });

    it('should allow removing a workout', () => {
      const user = userRepo.createUser('athlete', 'Pass1234');
      workoutRepo.createWorkout(user.id, 1, 1, 2026);
      workoutRepo.createWorkout(user.id, 2, 1, 2026);
      workoutRepo.deleteWorkout(user.id, 1, 1, 2026);
      const workouts = workoutRepo.findWorkoutsByMonth(user.id, 1, 2026);
      assert.strictEqual(workouts.length, 1);
      assert.strictEqual(workouts[0].day, 2);
    });
  });

  // ─── clearTestDatabase helper ─────────────────────────────

  describe('clearTestDatabase (testDatabase helper)', () => {
    it('should clear all users, workouts and goals', () => {
      const user = userRepo.createUser('a', 'Pass1234');
      workoutRepo.createWorkout(user.id, 1, 1, 2026);
      goalRepo.setGoal(user.id, 200);

      clearTestDatabase(db);

      assert.strictEqual(userRepo.findUserByUsername('a'), undefined);
    });
  });
});
