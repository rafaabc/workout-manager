export default class WorkoutRepository {
  constructor(db) {
    this.db = db;
  }

  createWorkout(userId, day, month, year) {
    const stmt = this.db.prepare(
      'INSERT INTO workouts (user_id, day, month, year) VALUES (?, ?, ?, ?)'
    );
    return stmt.run(userId, day, month, year);
  }

  deleteWorkout(userId, day, month, year) {
    const stmt = this.db.prepare(
      'DELETE FROM workouts WHERE user_id = ? AND day = ? AND month = ? AND year = ?'
    );
    return stmt.run(userId, day, month, year);
  }

  findWorkoutByDate(userId, day, month, year) {
    const stmt = this.db.prepare(
      'SELECT * FROM workouts WHERE user_id = ? AND day = ? AND month = ? AND year = ?'
    );
    return stmt.get(userId, day, month, year);
  }

  findWorkoutsByMonth(userId, month, year) {
    const stmt = this.db.prepare(
      'SELECT day, month, year FROM workouts WHERE user_id = ? AND month = ? AND year = ?'
    );
    return stmt.all(userId, month, year);
  }

  countWorkoutsByYear(userId, year) {
    const stmt = this.db.prepare(
      'SELECT month, COUNT(*) as totalWorkouts FROM workouts WHERE user_id = ? AND year = ? GROUP BY month'
    );
    return stmt.all(userId, year);
  }
}
