import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Validators from '../../../frontend/src/utils/validators.js';

describe('Validators', () => {
  // ─── validateUsername ──────────────────────────────────────

  describe('validateUsername', () => {
    it('should return valid for a proper username', () => {
      const result = Validators.validateUsername('john');
      assert.strictEqual(result.isValid, true);
    });

    it('should return invalid when username is empty', () => {
      const result = Validators.validateUsername('');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Username is required');
    });

    it('should return invalid when username is null', () => {
      const result = Validators.validateUsername(null);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Username is required');
    });

    it('should return invalid when username is undefined', () => {
      const result = Validators.validateUsername(undefined);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Username is required');
    });

    it('should return invalid when username is only spaces', () => {
      const result = Validators.validateUsername('   ');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Username is required');
    });

    it('should return invalid when username has less than 3 characters', () => {
      const result = Validators.validateUsername('ab');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Username must have at least 3 characters');
    });

    it('should return valid for username with exactly 3 characters', () => {
      const result = Validators.validateUsername('abc');
      assert.strictEqual(result.isValid, true);
    });

    it('should return valid for a long username', () => {
      const result = Validators.validateUsername('a'.repeat(50));
      assert.strictEqual(result.isValid, true);
    });
  });

  // ─── validatePassword ─────────────────────────────────────

  describe('validatePassword', () => {
    it('should return valid for a proper password with letters and numbers', () => {
      const result = Validators.validatePassword('Abcdef12');
      assert.strictEqual(result.isValid, true);
    });

    it('should return invalid when password is empty', () => {
      const result = Validators.validatePassword('');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Password is required');
    });

    it('should return invalid when password is null', () => {
      const result = Validators.validatePassword(null);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Password is required');
    });

    it('should return invalid when password is undefined', () => {
      const result = Validators.validatePassword(undefined);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Password is required');
    });

    it('should return invalid when password has less than 8 characters', () => {
      const result = Validators.validatePassword('Ab1');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Password must have at least 8 characters');
    });

    it('should return invalid when password has only letters', () => {
      const result = Validators.validatePassword('abcdefgh');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Password must contain letters and numbers');
    });

    it('should return invalid when password has only numbers', () => {
      const result = Validators.validatePassword('12345678');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Password must contain letters and numbers');
    });

    it('should return valid for password with exactly 8 characters', () => {
      const result = Validators.validatePassword('Abcdefg1');
      assert.strictEqual(result.isValid, true);
    });

    it('should return valid for long password with letters and numbers', () => {
      const result = Validators.validatePassword('A1' + 'b'.repeat(20));
      assert.strictEqual(result.isValid, true);
    });
  });

  // ─── validateGoal ──────────────────────────────────────────

  describe('validateGoal', () => {
    it('should return valid for a positive number', () => {
      const result = Validators.validateGoal(200);
      assert.strictEqual(result.isValid, true);
    });

    it('should return valid for a string containing a positive number', () => {
      const result = Validators.validateGoal('150');
      assert.strictEqual(result.isValid, true);
    });

    it('should return invalid for zero', () => {
      const result = Validators.validateGoal(0);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Goal must be a positive number');
    });

    it('should return invalid for negative number', () => {
      const result = Validators.validateGoal(-5);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Goal must be a positive number');
    });

    it('should return invalid for non-numeric string', () => {
      const result = Validators.validateGoal('abc');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Goal must be a positive number');
    });

    it('should return invalid for NaN', () => {
      const result = Validators.validateGoal(Number.NaN);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Goal must be a positive number');
    });

    it('should return invalid for empty string', () => {
      const result = Validators.validateGoal('');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Goal must be a positive number');
    });

    it('should return valid for a float greater than 0', () => {
      const result = Validators.validateGoal(1.5);
      assert.strictEqual(result.isValid, true);
    });
  });
});
