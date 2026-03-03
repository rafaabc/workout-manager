import { workouts } from '../models/db.js';

export function getCalendar(username, month, year) {
  if (!workouts[username]) workouts[username] = [];
  return workouts[username].filter(t => t.month == month && t.year == year);
}

export function setWorkout(username, day, month, year) {
  if (!workouts[username]) workouts[username] = [];
  if (workouts[username].some(t => t.day == day && t.month == month && t.year == year))
    throw new Error('Treino já marcado para este day');
  workouts[username].push({ day, month, year });
}

export function unsetWorkout(username, day, month, year) {
  if (!workouts[username]) workouts[username] = [];
  const idx = workouts[username].findIndex(t => t.day == day && t.month == month && t.year == year);
  if (idx === -1) throw new Error('Workout not found');
  workouts[username].splice(idx, 1);
}
