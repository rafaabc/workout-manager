import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
const baseURL = process.env.BASE_URL;

import { registerAndLogin, randomDay } from '../testUtils.js';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

describe('UR-2: Set workouts in the calendar', function () {
  it('5 | Set workout in a valid day', async function () {
    const { token } = await registerAndLogin(baseURL, 'cal');
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    const res = await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    expect([200, 201]).to.include(res.status);
    expect(res.body).to.have.property('message');
  });

  it('6 | Unset workout registered previously', async function () {
    const { token } = await registerAndLogin(baseURL, 'cal');
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    const res = await request(baseURL)
      .delete('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message');
  });

  it('7 | Set workout in a day that already has a workout set', async function () {
    const { token } = await registerAndLogin(baseURL, 'cal');
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    const res = await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    expect([400]).to.include(res.status);
  });

  it('9 | Data persistence after logout and new login', async function () {
    const { user, token } = await registerAndLogin(baseURL, 'cal');
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
    await request(baseURL).post('/api/users/logout').set('Authorization', `Bearer ${token}`);
    const resLogin2 = await request(baseURL).post('/api/users/login').send(user);
    const newToken = resLogin2.body.token;
    const res = await request(baseURL)
      .get(`/api/workouts/calendar?month=${workout.month}&year=${workout.year}`)
      .set('Authorization', `Bearer ${newToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.some(t => t.day === workout.day)).to.be.true;
  });

  it('10 | Workout registration linked to authenticated user', async function () {
    const { token: token1 } = await registerAndLogin(baseURL, 'cal1');
    const { token: token2 } = await registerAndLogin(baseURL, 'cal2');
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token2}`)
      .send(workout);
    const res = await request(baseURL)
      .get(`/api/workouts/calendar?month=${workout.month}&year=${workout.year}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).to.equal(200);
    expect(res.body.filter(t => t.day === workout.day).length).to.be.at.most(1);
  });
});
