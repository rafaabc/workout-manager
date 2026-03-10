import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase, clearTestDatabase } from '../testDatabase.js';
import UserRepository from '../../../src/repositories/userRepository.js';

describe('UserRepository', () => {
  let db;
  let repo;

  before(() => {
    db = createTestDatabase();
    repo = new UserRepository(db);
  });

  beforeEach(() => {
    clearTestDatabase(db);
  });

  after(() => {
    db.close();
  });

  describe('createUser', () => {
    it('should insert a new user and return id and username', () => {
      const result = repo.createUser('alice', 'Pass1234');
      assert.ok(result.id);
      assert.strictEqual(result.username, 'alice');
    });

    it('should throw when username already exists (UNIQUE constraint)', () => {
      repo.createUser('alice', 'Pass1234');
      assert.throws(() => repo.createUser('alice', 'Other123'), /UNIQUE constraint/);
    });

    it('should auto-increment ids for different users', () => {
      const u1 = repo.createUser('user1', 'Pass1234');
      const u2 = repo.createUser('user2', 'Pass1234');
      assert.ok(u2.id > u1.id);
    });
  });

  describe('findUserByUsername', () => {
    it('should return the user when found', () => {
      repo.createUser('bob', 'Pass1234');
      const user = repo.findUserByUsername('bob');
      assert.ok(user);
      assert.strictEqual(user.username, 'bob');
      assert.strictEqual(user.password_hash, 'Pass1234');
    });

    it('should return undefined when user does not exist', () => {
      const user = repo.findUserByUsername('nonexistent');
      assert.strictEqual(user, undefined);
    });
  });

  describe('findUserById', () => {
    it('should return the user when found by id', () => {
      const created = repo.createUser('charlie', 'Pass1234');
      const user = repo.findUserById(created.id);
      assert.ok(user);
      assert.strictEqual(user.username, 'charlie');
    });

    it('should return undefined for non-existing id', () => {
      const user = repo.findUserById(9999);
      assert.strictEqual(user, undefined);
    });
  });
});
