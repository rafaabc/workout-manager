let userRepository;
let workoutRepository;
let goalRepository;

export function setMetricsRepositories(userRepo, workoutRepo, goalRepo) {
  userRepository = userRepo;
  workoutRepository = workoutRepo;
  goalRepository = goalRepo;
}

export function getMetrics(username) {
  const user = userRepository.findUserByUsername(username);
  if (!user) throw new Error('User not found');

  const goalRecord = goalRepository.getGoalByUser(user.id);
  const goal = goalRecord ? goalRecord.annual_goal : 0;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const workoutsByMonth = workoutRepository.countWorkoutsByYear(user.id, currentYear);
  const monthMap = {};
  for (const row of workoutsByMonth) {
    monthMap[row.month] = row.totalWorkouts;
  }

  const monthlyData = Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    return { month, totalWorkouts: monthMap[month] || 0 };
  });

  const totalYear = monthlyData.reduce((sum, m) => sum + m.totalWorkouts, 0);
  const totalMonth = monthlyData[currentMonth - 1].totalWorkouts;
  const percentage = goal ? Math.round((totalYear / goal) * 100) : 0;

  return { goal, totalYear, totalMonth, percentage, monthlyData };
}

export function setGoal(username, goal) {
  const user = userRepository.findUserByUsername(username);
  if (!user) throw new Error('User not found');
  if (typeof goal !== 'number' || goal <= 0) {
    throw new Error('The annual goal should be a number greater than zero.');
  }
  goalRepository.setGoal(user.id, goal);
  return goal;
}
