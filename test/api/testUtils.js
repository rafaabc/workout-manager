import { randomInt, randomBytes } from 'node:crypto';
import request from 'supertest';

export async function registerAndLogin(baseURL, prefix = 'user') {
  const user = { username: randomUsername(prefix), password: validPassword() };
  await request(baseURL).post('/api/users/register').send(user);
  const resLogin = await request(baseURL).post('/api/users/login').send(user);
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
