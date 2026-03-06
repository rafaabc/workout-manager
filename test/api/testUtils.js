export function randomUsername(prefix = 'user') {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

export function validPassword() {
  return 'Password' + Math.floor(Math.random() * 100000);
}

export function randomDay() {
  return Math.floor(Math.random() * 27) + 1; // 1 a 28
}
