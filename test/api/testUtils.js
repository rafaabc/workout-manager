import { randomInt, randomBytes } from 'node:crypto';

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
