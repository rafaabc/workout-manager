class Validators {
  /**
   * Validate username
   */
  static validateUsername(username) {
    if (!username || username.trim().length === 0) {
      return { isValid: false, message: 'Username is required' };
    }

    if (username.length < 3) {
      return { isValid: false, message: 'Username must have at least 3 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate password
   */
  static validatePassword(password) {
    if (!password || password.length === 0) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Password must have at least 8 characters' };
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);

    if (!hasLetters || !hasNumbers) {
      return { isValid: false, message: 'Password must contain letters and numbers' };
    }

    return { isValid: true };
  }

  /**
   * Validate goal (must be a positive number)
   */
  static validateGoal(goal) {
    const num = Number(goal);

    if (isNaN(num) || num <= 0) {
      return { isValid: false, message: 'Goal must be a positive number' };
    }

    return { isValid: true };
  }
}

export default Validators;
