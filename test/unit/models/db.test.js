import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { users, workouts } from '../../../src/models/db.js';
import { resetDatabase, seedUser, seedWorkout } from '../testHelper.js';

describe('In-memory Database (db.js)', () => {
  beforeEach(() => {
    resetDatabase();
  });

  // ─── users store ───────────────────────────────────────────

  describe('users store', () => {
    it('should start empty after reset', () => {
      assert.deepStrictEqual(Object.keys(users), []);
    });

    it('should store a user keyed by username', () => {
      users['alice'] = { username: 'alice', password: 'Alice123', goal: 0 };

      assert.ok(users['alice']);
      assert.strictEqual(users['alice'].username, 'alice');
    });

    it('should allow multiple users', () => {
      seedUser('u1', 'Pass1234');
      seedUser('u2', 'Pass1234');

      assert.strictEqual(Object.keys(users).length, 2);
    });

    it('should overwrite user data when same key is set again', () => {
      seedUser('u1', 'Pass1234', 0);
      users['u1'].goal = 100;

      assert.strictEqual(users['u1'].goal, 100);
    });

    it('should return undefined for a non-existing user', () => {
      assert.strictEqual(users['ghost'], undefined);
    });

    it('should delete a user correctly', () => {
      seedUser('toRemove', 'Pass1234');
      delete users['toRemove'];

      assert.strictEqual(users['toRemove'], undefined);
    });
  });

  // ─── workouts store ────────────────────────────────────────

  describe('workouts store', () => {
    it('should start empty after reset', () => {
      assert.deepStrictEqual(Object.keys(workouts), []);
    });

    it('should store workouts array per user', () => {
      seedUser('athlete');
      seedWorkout('athlete', 1, 3, 2026);

      assert.ok(Array.isArray(workouts['athlete']));
      assert.strictEqual(workouts['athlete'].length, 1);
    });

    it('should keep workouts isolated between users', () => {
      seedUser('a');
      seedUser('b');
      seedWorkout('a', 1, 1, 2026);
      seedWorkout('b', 2, 2, 2026);
      seedWorkout('b', 3, 2, 2026);

      assert.strictEqual(workouts['a'].length, 1);
      assert.strictEqual(workouts['b'].length, 2);
    });

    it('should store workout entries with day, month, year', () => {
      seedUser('athlete');
      seedWorkout('athlete', 15, 6, 2026);

      const w = workouts['athlete'][0];
      assert.strictEqual(w.day, 15);
      assert.strictEqual(w.month, 6);
      assert.strictEqual(w.year, 2026);
    });

    it('should allow removing a workout by splice', () => {
      seedUser('athlete');
      seedWorkout('athlete', 1, 1, 2026);
      seedWorkout('athlete', 2, 1, 2026);

      workouts['athlete'].splice(0, 1);
      assert.strictEqual(workouts['athlete'].length, 1);
      assert.strictEqual(workouts['athlete'][0].day, 2);
    });
  });

  // ─── resetDatabase helper ─────────────────────────────────

  describe('resetDatabase (testHelper)', () => {
    it('should clear all users and workouts', () => {
      // Arrange
      seedUser('a');
      seedUser('b');
      seedWorkout('a', 1, 1, 2026);

      // Act
      resetDatabase();

      // Assert
      assert.strictEqual(Object.keys(users).length, 0);
      assert.strictEqual(Object.keys(workouts).length, 0);
    });
  });
});
