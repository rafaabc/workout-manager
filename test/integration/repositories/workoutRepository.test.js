import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase, clearTestDatabase } from '../testDatabase.js';
import UserRepository from '../../../src/repositories/userRepository.js';
import WorkoutRepository from '../../../src/repositories/workoutRepository.js';

describe('WorkoutRepository', () => {
  let db;
  let userRepo;
  let repo;
  let userId;

  before(() => {
    db = createTestDatabase();
    userRepo = new UserRepository(db);
    repo = new WorkoutRepository(db);
  });

  beforeEach(() => {
    clearTestDatabase(db);
    const user = userRepo.createUser('athlete', 'Pass1234');
    userId = user.id;
  });

  after(() => {
    db.close();
  });

  describe('createWorkout', () => {
    it('should insert a workout successfully', () => {
      const result = repo.createWorkout(userId, 10, 3, 2026);
      assert.ok(result.lastInsertRowid);
    });

    it('should enforce UNIQUE constraint on (user_id, day, month, year)', () => {
      repo.createWorkout(userId, 10, 3, 2026);
      assert.throws(() => repo.createWorkout(userId, 10, 3, 2026), /UNIQUE constraint/);
    });

    it('should allow same day for different users', () => {
      const user2 = userRepo.createUser('other', 'Pass1234');
      repo.createWorkout(userId, 10, 3, 2026);
      assert.doesNotThrow(() => repo.createWorkout(user2.id, 10, 3, 2026));
    });

    it('should enforce foreign key constraint', () => {
      assert.throws(() => repo.createWorkout(9999, 10, 3, 2026), /FOREIGN KEY constraint/);
    });
  });

  describe('deleteWorkout', () => {
    it('should delete an existing workout and return changes = 1', () => {
      repo.createWorkout(userId, 10, 3, 2026);
      const result = repo.deleteWorkout(userId, 10, 3, 2026);
      assert.strictEqual(result.changes, 1);
    });

    it('should return changes = 0 when workout does not exist', () => {
      const result = repo.deleteWorkout(userId, 10, 3, 2026);
      assert.strictEqual(result.changes, 0);
    });
  });

  describe('findWorkoutByDate', () => {
    it('should return the workout when found', () => {
      repo.createWorkout(userId, 15, 6, 2026);
      const workout = repo.findWorkoutByDate(userId, 15, 6, 2026);
      assert.ok(workout);
      assert.strictEqual(workout.day, 15);
      assert.strictEqual(workout.month, 6);
      assert.strictEqual(workout.year, 2026);
    });

    it('should return undefined when not found', () => {
      const workout = repo.findWorkoutByDate(userId, 1, 1, 2026);
      assert.strictEqual(workout, undefined);
    });
  });

  describe('findWorkoutsByMonth', () => {
    it('should return all workouts for a given month and year', () => {
      repo.createWorkout(userId, 1, 3, 2026);
      repo.createWorkout(userId, 15, 3, 2026);
      repo.createWorkout(userId, 5, 4, 2026);

      const results = repo.findWorkoutsByMonth(userId, 3, 2026);
      assert.strictEqual(results.length, 2);
    });

    it('should return empty array when no workouts exist', () => {
      const results = repo.findWorkoutsByMonth(userId, 1, 2026);
      assert.deepStrictEqual(results, []);
    });

    it('should not return workouts from other users', () => {
      const user2 = userRepo.createUser('other', 'Pass1234');
      repo.createWorkout(user2.id, 10, 3, 2026);

      const results = repo.findWorkoutsByMonth(userId, 3, 2026);
      assert.strictEqual(results.length, 0);
    });
  });

  describe('countWorkoutsByYear', () => {
    it('should return monthly counts for a given year', () => {
      repo.createWorkout(userId, 1, 1, 2026);
      repo.createWorkout(userId, 2, 1, 2026);
      repo.createWorkout(userId, 1, 6, 2026);

      const counts = repo.countWorkoutsByYear(userId, 2026);
      assert.strictEqual(counts.length, 2); // 2 months with data
      const jan = counts.find(c => c.month === 1);
      assert.strictEqual(jan.totalWorkouts, 2);
      const jun = counts.find(c => c.month === 6);
      assert.strictEqual(jun.totalWorkouts, 1);
    });

    it('should return empty array when no workouts exist for the year', () => {
      const counts = repo.countWorkoutsByYear(userId, 2026);
      assert.deepStrictEqual(counts, []);
    });

    it('should not count workouts from a different year', () => {
      repo.createWorkout(userId, 1, 1, 2025);
      const counts = repo.countWorkoutsByYear(userId, 2026);
      assert.deepStrictEqual(counts, []);
    });
  });
});
