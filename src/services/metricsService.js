import { users, workouts } from '../models/db.js';

export function getMetrics(username) {
  const user = users[username];
  if (!user) throw new Error('User not found');

  // goal defaults to zero if not explicitly set by the user
  const goal = user.goal || 0;
  const workoutsUser = workouts[username] || [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // build an array with totals for each month (1–12)
  const monthlyData = Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    const total = workoutsUser.filter(t => t.year == currentYear && t.month == month).length;
    return { month, totalWorkouts: total };
  });

  const totalYear = monthlyData.reduce((sum, m) => sum + m.totalWorkouts, 0);
  const totalMonth = monthlyData[currentMonth - 1].totalWorkouts;
  const percentage = goal ? Math.round((totalYear / goal) * 100) : 0;

  return { goal, totalYear, totalMonth, percentage, monthlyData };
}

export function setGoal(username, goal) {
  if (!users[username]) throw new Error('User not found');
  if (typeof goal !== 'number' || goal <= 0) {
    throw new Error('The annual goal should be a number greater than zero.');
  }
  users[username].goal = goal;
  return goal; // return the new value so controllers can send it back
}
