import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { register, login } from '../../../src/services/userService.js';
import { resetDatabase, seedUser, validPassword } from '../testHelper.js';

const MSG_REQUIRED = 'Username and password required';
const MSG_PWD_RULE = 'Password must contain at least 8 characters, letters and numbers';
const MSG_INVALID_CREDS = 'Invalid credentials';

describe('UserService', () => {
  beforeEach(() => {
    resetDatabase();
  });

  // ─── register ──────────────────────────────

  describe('register', () => {
    it('should register a new user successfully', () => {
      const result = register('newuser', validPassword());
      assert.deepStrictEqual(result, { username: 'newuser' });
    });

    // ── Required fields ──
    const requiredCases = [
      ['username is missing', [undefined, 'Abcdef12']],
      ['password is missing', ['user1', undefined]],
      ['both are missing', [undefined, undefined]],
      ['username is empty string', ['', 'Abcdef12']],
      ['password is empty string', ['user1', '']],
    ];

    for (const [desc, [u, p]] of requiredCases) {
      it(`should throw when ${desc}`, () => {
        assert.throws(() => register(u, p), { message: MSG_REQUIRED });
      });
    }

    // ── Duplicate username ──
    it('should throw when username is already registered', () => {
      seedUser('existinguser', 'Test1234');
      assert.throws(() => register('existinguser', 'Abcdef12'), {
        message: 'Username already registered',
      });
    });

    // ── Password validation ──
    const invalidPwdCases = [
      ['less than 8 characters', 'Ab1'],
      ['only letters', 'abcdefgh'],
      ['only numbers', '12345678'],
      ['special characters', 'Abc@1234'],
    ];

    for (const [desc, pwd] of invalidPwdCases) {
      it(`should throw when password has ${desc}`, () => {
        assert.throws(() => register('user1', pwd), { message: MSG_PWD_RULE });
      });
    }

    it('should accept password with exactly 8 characters containing letters and numbers', () => {
      assert.deepStrictEqual(register('user1', 'Abcdefg1'), { username: 'user1' });
    });

    it('should initialize new user with goal equal to 0', async () => {
      register('user1', 'Abcdef12');
      const { users } = await import('../../../src/models/db.js');
      assert.strictEqual(users['user1'].goal, 0);
    });
  });

  // ─── login ────────────────────────────────

  describe('login', () => {
    it('should return a JWT token on valid credentials', () => {
      seedUser('loginuser', 'Test1234');
      const token = login('loginuser', 'Test1234');
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3, 'Token should be a valid JWT with 3 parts');
    });

    it('should throw when username does not exist', () => {
      assert.throws(() => login('nonexistent', 'Test1234'), { message: MSG_INVALID_CREDS });
    });

    it('should throw when password is incorrect', () => {
      seedUser('loginuser', 'Test1234');
      assert.throws(() => login('loginuser', 'WrongPass1'), { message: MSG_INVALID_CREDS });
    });

    it('should throw when both username and password are wrong', () => {
      assert.throws(() => login('nobody', 'WrongPass1'), { message: MSG_INVALID_CREDS });
    });
  });
});
