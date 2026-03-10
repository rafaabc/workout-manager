import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase, clearTestDatabase } from '../testDatabase.js';
import UserRepository from '../../../src/repositories/userRepository.js';
import GoalRepository from '../../../src/repositories/goalRepository.js';

describe('GoalRepository', () => {
  let db;
  let userRepo;
  let repo;
  let userId;

  before(() => {
    db = createTestDatabase();
    userRepo = new UserRepository(db);
    repo = new GoalRepository(db);
  });

  beforeEach(() => {
    clearTestDatabase(db);
    const user = userRepo.createUser('athlete', 'Pass1234');
    userId = user.id;
  });

  after(() => {
    db.close();
  });

  describe('setGoal', () => {
    it('should insert a new goal for a user', () => {
      repo.setGoal(userId, 200);
      const goal = repo.getGoalByUser(userId);
      assert.ok(goal);
      assert.strictEqual(goal.annual_goal, 200);
    });

    it('should update existing goal (upsert)', () => {
      repo.setGoal(userId, 200);
      repo.setGoal(userId, 300);
      const goal = repo.getGoalByUser(userId);
      assert.strictEqual(goal.annual_goal, 300);
    });

    it('should enforce foreign key constraint', () => {
      assert.throws(() => repo.setGoal(9999, 200), /FOREIGN KEY constraint/);
    });
  });

  describe('getGoalByUser', () => {
    it('should return the goal when set', () => {
      repo.setGoal(userId, 150);
      const goal = repo.getGoalByUser(userId);
      assert.ok(goal);
      assert.strictEqual(goal.annual_goal, 150);
      assert.strictEqual(goal.user_id, userId);
    });

    it('should return undefined when no goal is set', () => {
      const goal = repo.getGoalByUser(userId);
      assert.strictEqual(goal, undefined);
    });

    it('should not return goals from other users', () => {
      const user2 = userRepo.createUser('other', 'Pass1234');
      repo.setGoal(user2.id, 100);

      const goal = repo.getGoalByUser(userId);
      assert.strictEqual(goal, undefined);
    });
  });
});
