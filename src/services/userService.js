import jwt from 'jsonwebtoken';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { JWT_SECRET } from '../config.js';

let userRepository;

export function setUserRepository(repo) {
  userRepository = repo;
}

function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, derivedKey);
}

export function register(username, password) {
  if (!username || !password) throw new Error('Username and password required');
  if (userRepository.findUserByUsername(username)) throw new Error('Username already registered');
  if (!validatePassword(password))
    throw new Error('Password must contain at least 8 characters, letters and numbers');
  userRepository.createUser(username, hashPassword(password));
  return { username };
}

export function login(username, password) {
  const user = userRepository.findUserByUsername(username);
  if (!user) throw new Error('Invalid credentials');
  try {
    if (!verifyPassword(password, user.password_hash)) throw new Error('Invalid credentials');
  } catch {
    throw new Error('Invalid credentials');
  }
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
}
