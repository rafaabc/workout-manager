import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getMetrics, setGoal } from '../../../src/services/metricsService.js';
import { resetDatabase, seedUser, seedWorkout } from '../testHelper.js';

describe('MetricsService', () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  beforeEach(() => {
    resetDatabase();
    seedUser('athlete', 'Test1234', 0);
  });

  // ─── getMetrics ────────────────────────────────────────────

  describe('getMetrics', () => {
    it('should return zero totals when user has no workouts and no goal', () => {
      const metrics = getMetrics('athlete');

      assert.strictEqual(metrics.goal, 0);
      assert.strictEqual(metrics.totalYear, 0);
      assert.strictEqual(metrics.totalMonth, 0);
      assert.strictEqual(metrics.percentage, 0);
      assert.strictEqual(metrics.monthlyData.length, 12);
    });

    it('should calculate totalMonth correctly for the current month', () => {
      // Arrange
      seedWorkout('athlete', 1, currentMonth, currentYear);
      seedWorkout('athlete', 15, currentMonth, currentYear);

      // Act
      const metrics = getMetrics('athlete');

      // Assert
      assert.strictEqual(metrics.totalMonth, 2);
    });

    it('should calculate totalYear correctly across multiple months', () => {
      // Arrange – add workouts in different months
      seedWorkout('athlete', 1, 1, currentYear);
      seedWorkout('athlete', 2, 2, currentYear);
      seedWorkout('athlete', 3, 3, currentYear);

      // Act
      const metrics = getMetrics('athlete');

      // Assert
      assert.strictEqual(metrics.totalYear, 3);
    });

    it('should calculate percentage relative to the annual goal', () => {
      // Arrange
      seedUser('goaluser', 'Test1234', 100);
      seedWorkout('goaluser', 1, 1, currentYear);
      seedWorkout('goaluser', 2, 1, currentYear);
      // 2 workouts out of 100 goal = 2%

      // Act
      const metrics = getMetrics('goaluser');

      // Assert
      assert.strictEqual(metrics.percentage, 2);
      assert.strictEqual(metrics.goal, 100);
    });

    it('should round percentage correctly', () => {
      // Arrange – 1 workout out of 3 goal ≈ 33.33% → rounds to 33
      seedUser('rounding', 'Test1234', 3);
      seedWorkout('rounding', 1, 1, currentYear);

      // Act
      const metrics = getMetrics('rounding');

      // Assert
      assert.strictEqual(metrics.percentage, 33);
    });

    it('should return percentage 0 when goal is 0', () => {
      seedWorkout('athlete', 1, 1, currentYear);

      const metrics = getMetrics('athlete');
      assert.strictEqual(metrics.percentage, 0);
    });

    it('should return monthlyData with 12 entries', () => {
      const metrics = getMetrics('athlete');

      assert.strictEqual(metrics.monthlyData.length, 12);
      metrics.monthlyData.forEach((entry, idx) => {
        assert.strictEqual(entry.month, idx + 1);
        assert.strictEqual(typeof entry.totalWorkouts, 'number');
      });
    });

    it('should have correct per-month totals in monthlyData', () => {
      // Arrange
      seedWorkout('athlete', 1, 1, currentYear);
      seedWorkout('athlete', 2, 1, currentYear);
      seedWorkout('athlete', 1, 6, currentYear);

      // Act
      const metrics = getMetrics('athlete');

      // Assert
      assert.strictEqual(metrics.monthlyData[0].totalWorkouts, 2); // January
      assert.strictEqual(metrics.monthlyData[5].totalWorkouts, 1); // June
      assert.strictEqual(metrics.monthlyData[11].totalWorkouts, 0); // December
    });

    it('should not count workouts from a different year', () => {
      seedWorkout('athlete', 1, 1, currentYear - 1);

      const metrics = getMetrics('athlete');
      assert.strictEqual(metrics.totalYear, 0);
    });

    it('should throw when user does not exist', () => {
      assert.throws(() => getMetrics('nonexistent'), {
        message: 'User not found',
      });
    });

    it('should only count workouts of the requested user', () => {
      // Arrange
      seedUser('other', 'Test1234', 0);
      seedWorkout('other', 1, currentMonth, currentYear);
      seedWorkout('athlete', 2, currentMonth, currentYear);

      // Act
      const metrics = getMetrics('athlete');

      // Assert
      assert.strictEqual(metrics.totalMonth, 1);
      assert.strictEqual(metrics.totalYear, 1);
    });

    it('should allow percentage > 100 when workouts exceed goal', () => {
      // Arrange
      seedUser('overachiever', 'Test1234', 2);
      seedWorkout('overachiever', 1, 1, currentYear);
      seedWorkout('overachiever', 2, 1, currentYear);
      seedWorkout('overachiever', 3, 1, currentYear);
      // 3 workouts / 2 goal = 150%

      // Act
      const metrics = getMetrics('overachiever');

      // Assert
      assert.strictEqual(metrics.percentage, 150);
    });
  });

  // ─── setGoal ───────────────────────────────────────────────

  describe('setGoal', () => {
    it('should set the annual goal for an existing user', () => {
      // Act
      const result = setGoal('athlete', 200);

      // Assert
      assert.strictEqual(result, 200);
    });

    it('should update existing goal to a new value', () => {
      // Arrange
      setGoal('athlete', 100);

      // Act
      const result = setGoal('athlete', 300);

      // Assert
      assert.strictEqual(result, 300);
      const metrics = getMetrics('athlete');
      assert.strictEqual(metrics.goal, 300);
    });

    it('should throw when user does not exist', () => {
      assert.throws(() => setGoal('ghost', 200), {
        message: 'User not found',
      });
    });

    it('should throw when goal is not a number', () => {
      assert.throws(() => setGoal('athlete', 'abc'), {
        message: 'The annual goal should be a number greater than zero.',
      });
    });

    it('should throw when goal is zero', () => {
      assert.throws(() => setGoal('athlete', 0), {
        message: 'The annual goal should be a number greater than zero.',
      });
    });

    it('should throw when goal is negative', () => {
      assert.throws(() => setGoal('athlete', -10), {
        message: 'The annual goal should be a number greater than zero.',
      });
    });

    it('should throw when goal is null', () => {
      assert.throws(() => setGoal('athlete', null), {
        message: 'The annual goal should be a number greater than zero.',
      });
    });

    it('should throw when goal is undefined', () => {
      assert.throws(() => setGoal('athlete', undefined), {
        message: 'The annual goal should be a number greater than zero.',
      });
    });

    it('should accept a valid positive integer goal', () => {
      const result = setGoal('athlete', 1);
      assert.strictEqual(result, 1);
    });

    it('should accept a valid positive float goal', () => {
      const result = setGoal('athlete', 1.5);
      assert.strictEqual(result, 1.5);
    });
  });
});
