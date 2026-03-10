export default class GoalRepository {
  constructor(db) {
    this.db = db;
  }

  setGoal(userId, annualGoal) {
    const stmt = this.db.prepare(
      `INSERT INTO goals (user_id, annual_goal) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET annual_goal = excluded.annual_goal`
    );
    return stmt.run(userId, annualGoal);
  }

  getGoalByUser(userId) {
    const stmt = this.db.prepare('SELECT * FROM goals WHERE user_id = ?');
    return stmt.get(userId);
  }
}
