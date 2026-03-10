export default class UserRepository {
  constructor(db) {
    this.db = db;
  }

  createUser(username, passwordHash) {
    const stmt = this.db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const result = stmt.run(username, passwordHash);
    return { id: result.lastInsertRowid, username };
  }

  findUserByUsername(username) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  findUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }
}
