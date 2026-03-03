import jwt from 'jsonwebtoken';
import { users } from '../models/db.js';
const SECRET = 'supersecretkey';

function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

export function register(username, password) {
  if (!username || !password) throw new Error('Username and password required');
  if (users[username]) throw new Error('Username already registered');
  if (!validatePassword(password))
    throw new Error('Password must contain at least 8 characters, letters and numbers');
  // new users start with no goal set (0)
  users[username] = { username, password, goal: 0 };
  return { username };
}

export function login(username, password) {
  const user = users[username];
  if (!user || user.password !== password) throw new Error('Invalid credentials');
  return jwt.sign({ username }, SECRET, { expiresIn: '12h' });
}
