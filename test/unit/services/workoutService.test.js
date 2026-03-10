import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getCalendar, setWorkout, unsetWorkout } from '../../../src/services/workoutService.js';
import { resetDatabase, seedUser, seedWorkout, initTestDatabase } from '../testHelper.js';

describe('WorkoutService', () => {
  before(() => {
    initTestDatabase();
  });

  beforeEach(() => {
    resetDatabase();
    seedUser('athlete');
  });

  // ─── getCalendar ───────────────────────────────────────────

  describe('getCalendar', () => {
    it('should return an empty array when user has no workouts', () => {
      const result = getCalendar('athlete', 3, 2026);
      assert.deepStrictEqual(result, []);
    });

    it('should return workouts for the requested month and year', () => {
      // Arrange
      seedWorkout('athlete', 1, 3, 2026);
      seedWorkout('athlete', 15, 3, 2026);
      seedWorkout('athlete', 5, 4, 2026); // different month

      // Act
      const result = getCalendar('athlete', 3, 2026);

      // Assert
      assert.strictEqual(result.length, 2);
      assert.deepStrictEqual(result[0], { day: 1, month: 3, year: 2026 });
      assert.deepStrictEqual(result[1], { day: 15, month: 3, year: 2026 });
    });

    it('should not return workouts from a different year', () => {
      seedWorkout('athlete', 1, 3, 2025);

      const result = getCalendar('athlete', 3, 2026);
      assert.strictEqual(result.length, 0);
    });

    it('should not return workouts from a different month', () => {
      seedWorkout('athlete', 10, 5, 2026);

      const result = getCalendar('athlete', 3, 2026);
      assert.strictEqual(result.length, 0);
    });

    it('should initialize workouts array for a new username', () => {
      const result = getCalendar('newathlete', 1, 2026);
      assert.deepStrictEqual(result, []);
    });

    it('should not return workouts from other users', () => {
      // Arrange
      seedUser('otherone');
      seedWorkout('otherone', 10, 3, 2026);

      // Act
      const result = getCalendar('athlete', 3, 2026);

      // Assert
      assert.strictEqual(result.length, 0);
    });
  });

  // ─── setWorkout ────────────────────────────────────────────

  describe('setWorkout', () => {
    it('should add a workout for the given day', () => {
      // Act
      setWorkout('athlete', 10, 3, 2026);

      // Assert
      const calendar = getCalendar('athlete', 3, 2026);
      assert.strictEqual(calendar.length, 1);
      assert.deepStrictEqual(calendar[0], { day: 10, month: 3, year: 2026 });
    });

    it('should allow workouts on different days of the same month', () => {
      setWorkout('athlete', 1, 3, 2026);
      setWorkout('athlete', 2, 3, 2026);

      const calendar = getCalendar('athlete', 3, 2026);
      assert.strictEqual(calendar.length, 2);
    });

    it('should throw when a workout already exists for the same day (one workout per day rule)', () => {
      // Arrange
      setWorkout('athlete', 10, 3, 2026);

      // Act & Assert
      assert.throws(() => setWorkout('athlete', 10, 3, 2026), {
        message: 'Treino já marcado para este day',
      });
    });

    it('should allow the same day in different months', () => {
      setWorkout('athlete', 10, 3, 2026);
      // Should not throw
      assert.doesNotThrow(() => setWorkout('athlete', 10, 4, 2026));
    });

    it('should allow the same day and month in different years', () => {
      setWorkout('athlete', 10, 3, 2025);
      assert.doesNotThrow(() => setWorkout('athlete', 10, 3, 2026));
    });

    it('should allow setting a workout for a different registered user', () => {
      seedUser('brandnew');
      assert.doesNotThrow(() => setWorkout('brandnew', 1, 1, 2026));
      const result = getCalendar('brandnew', 1, 2026);
      assert.strictEqual(result.length, 1);
    });
  });

  // ─── unsetWorkout ──────────────────────────────────────────

  describe('unsetWorkout', () => {
    it('should remove an existing workout', () => {
      // Arrange
      setWorkout('athlete', 5, 3, 2026);

      // Act
      unsetWorkout('athlete', 5, 3, 2026);

      // Assert
      const calendar = getCalendar('athlete', 3, 2026);
      assert.strictEqual(calendar.length, 0);
    });

    it('should throw when workout does not exist', () => {
      assert.throws(() => unsetWorkout('athlete', 5, 3, 2026), {
        message: 'Workout not found',
      });
    });

    it('should not affect other workouts when removing one', () => {
      // Arrange
      setWorkout('athlete', 5, 3, 2026);
      setWorkout('athlete', 10, 3, 2026);

      // Act
      unsetWorkout('athlete', 5, 3, 2026);

      // Assert
      const calendar = getCalendar('athlete', 3, 2026);
      assert.strictEqual(calendar.length, 1);
      assert.deepStrictEqual(calendar[0], { day: 10, month: 3, year: 2026 });
    });

    it('should allow removing and re-adding the same workout', () => {
      setWorkout('athlete', 5, 3, 2026);
      unsetWorkout('athlete', 5, 3, 2026);
      assert.doesNotThrow(() => setWorkout('athlete', 5, 3, 2026));
    });

    it('should throw when user does not exist', () => {
      assert.throws(() => unsetWorkout('unknown', 5, 3, 2026), {
        message: 'User not found',
      });
    });
  });
});
