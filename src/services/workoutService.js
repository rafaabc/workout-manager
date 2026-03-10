let workoutRepository;
let userRepository;

export function setWorkoutRepositories(workoutRepo, userRepo) {
  workoutRepository = workoutRepo;
  userRepository = userRepo;
}

export function getCalendar(username, month, year) {
  const user = userRepository.findUserByUsername(username);
  if (!user) return [];
  return workoutRepository.findWorkoutsByMonth(user.id, month, year);
}

export function setWorkout(username, day, month, year) {
  const user = userRepository.findUserByUsername(username);
  if (!user) throw new Error('User not found');
  const existing = workoutRepository.findWorkoutByDate(user.id, day, month, year);
  if (existing) throw new Error('Treino já marcado para este day');
  workoutRepository.createWorkout(user.id, day, month, year);
}

export function unsetWorkout(username, day, month, year) {
  const user = userRepository.findUserByUsername(username);
  if (!user) throw new Error('User not found');
  const result = workoutRepository.deleteWorkout(user.id, day, month, year);
  if (result.changes === 0) throw new Error('Workout not found');
}
