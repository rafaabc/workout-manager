import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
const baseURL = process.env.BASE_URL;

import { randomUsername, validPassword, invalidPassword } from '../testUtils.js';

describe('UR-1: User Register and Login', function () {
  let validUser;

  it('1 | Register new user with valid data', async function () {
    validUser = { username: randomUsername('valid'), password: validPassword() };
    const res = await request(baseURL).post('/api/users/register').send(validUser);
    expect([200, 201]).to.include(res.status);
  });

  it('2 | Register user that already exists', async function () {
    const res = await request(baseURL).post('/api/users/register').send(validUser);
    // duplicate registration should result in HTTP 409 Conflict
    expect(res.status).to.equal(409);
  });

  it('3 | Register user with invalid password', async function () {
    const user = { username: randomUsername('invalid'), password: invalidPassword() };
    const res = await request(baseURL).post('/api/users/register').send(user);
    expect(res.status).to.equal(400);
  });

  it('4 | Login with valid credentials', async function () {
    const res = await request(baseURL).post('/api/users/login').send(validUser);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
  });

  it('5 | Login without username', async function () {
    const user = { username: randomUsername('notexist'), password: validPassword() };
    const res = await request(baseURL).post('/api/users/login').send(user);
    expect(res.status).to.equal(401);
  });

  it('6 | Login with incorrect password', async function () {
    // Usa o mesmo username válido, mas senha errada
    const user = { username: validUser.username, password: validPassword() };
    const res = await request(baseURL).post('/api/users/login').send(user);
    expect(res.status).to.equal(401);
  });
});
