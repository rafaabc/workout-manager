import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { register, login } from '../../../src/services/userService.js';
import { resetDatabase, seedUser } from '../testHelper.js';

describe('UserService', () => {
  beforeEach(() => {
    resetDatabase();
  });

  // ─── register ──────────────────────────────────────────────

  describe('register', () => {
    it('should register a new user successfully', () => {
      // Arrange
      const username = 'newuser';
      const password = 'Abcdef12';

      // Act
      const result = register(username, password);

      // Assert
      assert.deepStrictEqual(result, { username: 'newuser' });
    });

    it('should throw when username is missing', () => {
      assert.throws(() => register(undefined, 'Abcdef12'), {
        message: 'Username and password required',
      });
    });

    it('should throw when password is missing', () => {
      assert.throws(() => register('user1', undefined), {
        message: 'Username and password required',
      });
    });

    it('should throw when both username and password are missing', () => {
      assert.throws(() => register(undefined, undefined), {
        message: 'Username and password required',
      });
    });

    it('should throw when username is empty string', () => {
      assert.throws(() => register('', 'Abcdef12'), {
        message: 'Username and password required',
      });
    });

    it('should throw when password is empty string', () => {
      assert.throws(() => register('user1', ''), {
        message: 'Username and password required',
      });
    });

    // ── Duplicate username ──

    it('should throw when username is already registered', () => {
      // Arrange
      seedUser('existinguser', 'Test1234');

      // Act & Assert
      assert.throws(() => register('existinguser', 'Abcdef12'), {
        message: 'Username already registered',
      });
    });

    // ── Password validation ──

    it('should throw when password has less than 8 characters', () => {
      assert.throws(() => register('user1', 'Ab1'), {
        message: 'Password must contain at least 8 characters, letters and numbers',
      });
    });

    it('should throw when password has only letters', () => {
      assert.throws(() => register('user1', 'abcdefgh'), {
        message: 'Password must contain at least 8 characters, letters and numbers',
      });
    });

    it('should throw when password has only numbers', () => {
      assert.throws(() => register('user1', '12345678'), {
        message: 'Password must contain at least 8 characters, letters and numbers',
      });
    });

    it('should throw when password contains special characters', () => {
      assert.throws(() => register('user1', 'Abc@1234'), {
        message: 'Password must contain at least 8 characters, letters and numbers',
      });
    });

    it('should accept password with exactly 8 characters containing letters and numbers', () => {
      const result = register('user1', 'Abcdefg1');
      assert.deepStrictEqual(result, { username: 'user1' });
    });

    it('should initialize new user with goal equal to 0', async () => {
      // Arrange & Act
      register('user1', 'Abcdef12');

      // Assert – access db directly to verify internal state
      const { users } = await import('../../../src/models/db.js');
      assert.strictEqual(users['user1'].goal, 0);
    });
  });

  // ─── login ─────────────────────────────────────────────────

  describe('login', () => {
    it('should return a JWT token on valid credentials', () => {
      // Arrange
      seedUser('loginuser', 'Test1234');

      // Act
      const token = login('loginuser', 'Test1234');

      // Assert
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3, 'Token should be a valid JWT with 3 parts');
    });

    it('should throw when username does not exist', () => {
      assert.throws(() => login('nonexistent', 'Test1234'), {
        message: 'Invalid credentials',
      });
    });

    it('should throw when password is incorrect', () => {
      // Arrange
      seedUser('loginuser', 'Test1234');

      // Act & Assert
      assert.throws(() => login('loginuser', 'WrongPass1'), {
        message: 'Invalid credentials',
      });
    });

    it('should throw when both username and password are wrong', () => {
      assert.throws(() => login('nobody', 'WrongPass1'), {
        message: 'Invalid credentials',
      });
    });
  });
});
