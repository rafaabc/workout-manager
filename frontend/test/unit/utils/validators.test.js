import Validators from '../../../src/utils/validators.js';

describe('Validators', () => {
  // ====== validateUsername ======
  describe('validateUsername', () => {
    test('should accept a valid username', () => {
      // Arrange
      const username = 'john';

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should accept username with exactly 3 characters', () => {
      // Arrange
      const username = 'abc';

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should reject null username', () => {
      // Arrange
      const username = null;

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username is required');
    });

    test('should reject undefined username', () => {
      // Arrange
      const username = undefined;

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username is required');
    });

    test('should reject empty string username', () => {
      // Arrange
      const username = '';

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username is required');
    });

    test('should reject whitespace-only username', () => {
      // Arrange
      const username = '   ';

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username is required');
    });

    test('should reject username with less than 3 characters', () => {
      // Arrange
      const username = 'ab';

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username must have at least 3 characters');
    });

    test('should reject single character username', () => {
      // Arrange
      const username = 'a';

      // Act
      const result = Validators.validateUsername(username);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username must have at least 3 characters');
    });
  });

  // ====== validatePassword ======
  describe('validatePassword', () => {
    test('should accept a valid password with letters and numbers', () => {
      // Arrange
      const password = 'test1234';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should accept password with exactly 8 characters', () => {
      // Arrange
      const password = 'abcdef12';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should accept long password with letters and numbers', () => {
      // Arrange
      const password = 'abcdefghijk123456';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should accept password with uppercase letters and numbers', () => {
      // Arrange
      const password = 'ABCDEF12';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should accept password with mixed case and numbers', () => {
      // Arrange
      const password = 'AbCdEf12';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should reject null password', () => {
      // Arrange
      const password = null;

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    test('should reject undefined password', () => {
      // Arrange
      const password = undefined;

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    test('should reject empty string password', () => {
      // Arrange
      const password = '';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    test('should reject password shorter than 8 characters', () => {
      // Arrange
      const password = 'abc123';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must have at least 8 characters');
    });

    test('should reject password with 7 characters', () => {
      // Arrange
      const password = 'abcde12';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must have at least 8 characters');
    });

    test('should reject password with only letters (no numbers)', () => {
      // Arrange
      const password = 'abcdefgh';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain letters and numbers');
    });

    test('should reject password with only numbers (no letters)', () => {
      // Arrange
      const password = '12345678';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain letters and numbers');
    });

    test('should reject password with special characters only', () => {
      // Arrange
      const password = '!@#$%^&*';

      // Act
      const result = Validators.validatePassword(password);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain letters and numbers');
    });
  });

  // ====== validateGoal ======
  describe('validateGoal', () => {
    test('should accept a valid positive number', () => {
      // Arrange
      const goal = 200;

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should accept goal of 1', () => {
      // Arrange
      const goal = 1;

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should accept a numeric string', () => {
      // Arrange
      const goal = '150';

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(true);
    });

    test('should reject zero', () => {
      // Arrange
      const goal = 0;

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Goal must be a positive number');
    });

    test('should reject negative number', () => {
      // Arrange
      const goal = -10;

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Goal must be a positive number');
    });

    test('should reject NaN value', () => {
      // Arrange
      const goal = 'abc';

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Goal must be a positive number');
    });

    test('should reject null value', () => {
      // Arrange
      const goal = null;

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Goal must be a positive number');
    });

    test('should reject undefined value', () => {
      // Arrange
      const goal = undefined;

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Goal must be a positive number');
    });

    test('should reject empty string', () => {
      // Arrange
      const goal = '';

      // Act
      const result = Validators.validateGoal(goal);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Goal must be a positive number');
    });
  });
});
