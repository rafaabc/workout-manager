// In-memory database
export const users = {
  // Pre-created test user to speed up manual testing
  // username: testuser
  // password: Test1234
  testuser: { username: 'testuser', password: 'Test1234', goal: 0 },
};

export const workouts = {
  // Initialize empty workouts array for test user to avoid stale data
  testuser: [],
};
