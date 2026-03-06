import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
const baseURL = process.env.BASE_URL;

import { randomUsername, validPassword, randomDay } from '../testUtils.js';

// use current date to avoid month/year hardcoding
const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

describe('UR-3: Metrics for Planned vs. Actual Workouts', function () {
  it('0 | New user starts with empty metrics structure', async function () {
    const user = { username: randomUsername('met0'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;

    const res = await request(baseURL).get('/api/metrics').set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('goal');
    expect(res.body.goal).to.equal(0);
    expect(res.body).to.have.property('monthlyData');
    expect(res.body.monthlyData).to.be.an('array').with.lengthOf(12);
    res.body.monthlyData.forEach(m => expect(m.totalWorkouts).to.equal(0));
  });

  it('1 | Set a valid annual workout goal.', async function () {
    const user = { username: randomUsername('met1'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;
    const goal = { goal: 100 };
    const res = await request(baseURL)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send(goal);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.property('goal', 100);
  });

  it('2 | Set an invalid annual goal', async function () {
    const user = { username: randomUsername('met2'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;
    const goal = { goal: -10 };
    const res = await request(baseURL)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send(goal);
    expect(res.status).to.equal(400);
  });

  it('3 | Calculate the total number of workouts completed in the current month', async function () {
    const user = { username: randomUsername('met3'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;
    await request(baseURL)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 200 });
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    const res = await request(baseURL).get('/api/metrics').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('totalMonth');
    expect(res.body.totalMonth).to.equal(1);
    // monthlyData should reflect 1 workout in current month
    expect(res.body).to.have.property('monthlyData');
    expect(res.body.monthlyData[currentMonth - 1].totalWorkouts).to.equal(1);
  });

  it('4 | Calculate total workouts completed in the year', async function () {
    const user = { username: randomUsername('met4'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;
    await request(baseURL)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 200 });
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    const res = await request(baseURL).get('/api/metrics').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('totalYear');
    expect(res.body.totalYear).to.equal(1);
  });

  it('5 | Calculate the percentage of workouts completed in relation to the annual goal', async function () {
    const user = { username: randomUsername('met5'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;
    await request(baseURL)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 200 });
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    const res = await request(baseURL).get('/api/metrics').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('percentage');
    // percentage = round((totalYear/goal)*100)
    const expectedPercent = Math.round((1 / 200) * 100);
    expect(res.body.percentage).to.equal(expectedPercent);
  });

  it('6 | Update metrics when setting a workout', async function () {
    const user = { username: randomUsername('met6'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;
    await request(baseURL)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 100 });
    const workout1 = { day: randomDay(), month: currentMonth, year: currentYear };
    const workout2 = {
      day: workout1.day === 28 ? 27 : workout1.day + 1,
      month: currentMonth,
      year: currentYear,
    };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout1);
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout2);
    const res = await request(baseURL).get('/api/metrics').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.totalMonth).to.equal(2);
    expect(res.body.totalYear).to.equal(2);
    expect(res.body.monthlyData[currentMonth - 1].totalWorkouts).to.equal(2);
    const expectedPerc2 = Math.round((2 / 100) * 100);
    expect(res.body.percentage).to.equal(expectedPerc2);
  });

  it('7 | Update metrics when unsetting a workout', async function () {
    const user = { username: randomUsername('met7'), password: validPassword() };
    await request(baseURL).post('/api/users/register').send(user);
    const resLogin = await request(baseURL).post('/api/users/login').send(user);
    const token = resLogin.body.token;
    await request(baseURL)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 200 });
    const workout1 = { day: randomDay(), month: currentMonth, year: currentYear };
    const workout2 = {
      day: workout1.day === 28 ? 27 : workout1.day + 1,
      month: currentMonth,
      year: currentYear,
    };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout1);
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout2);
    await request(baseURL)
      .delete('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout2);
    const res = await request(baseURL).get('/api/metrics').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.totalMonth).to.equal(1);
    expect(res.body.totalYear).to.equal(1);
    const expectedPerc3 = Math.round((1 / 200) * 100);
    expect(res.body.percentage).to.equal(expectedPerc3);
  });

  it('8 | Display metrics only for authenticated users', async function () {
    const res = await request(baseURL).get('/api/metrics');
    expect(res.status).to.equal(401);
  });
});
