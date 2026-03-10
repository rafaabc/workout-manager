import { randomInt, randomBytes } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { closeDatabase } from '../../src/database/database.js';

/**
 * Creates an isolated Express app backed by an in-memory SQLite database.
 * Call this in a before() hook and pass the returned `app` to supertest.
 * Call closeTestApp() in an after() hook to release the database.
 */
export function createTestApp() {
  return createApp(':memory:');
}

export function closeTestApp() {
  closeDatabase();
}

export async function registerAndLogin(app, prefix = 'user') {
  const user = { username: randomUsername(prefix), password: validPassword() };
  await request(app).post('/api/users/register').send(user);
  const resLogin = await request(app).post('/api/users/login').send(user);
  return { user, token: resLogin.body.token };
}

export function randomUsername(prefix = 'user') {
  return `${prefix}_${randomBytes(4).toString('hex')}`;
}

export function validPassword() {
  return 'Password' + randomInt(100000);
}

export function invalidPassword() {
  return 'short';
}

export function randomDay() {
  return randomInt(1, 28); // 1 to 27
}
