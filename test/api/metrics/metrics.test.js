import request from 'supertest';
import { expect } from 'chai';
import { createTestApp, closeTestApp, registerAndLogin, randomDay } from '../testUtils.js';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

describe('UR-3: Metrics for Planned vs. Actual Workouts', function () {
  let app;

  function setGoal(token, goal) {
    return request(app)
      .post('/api/metrics/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal });
  }

  function addWorkout(token, workout) {
    return request(app)
      .post('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(workout);
  }

  function fetchMetrics(token) {
    return request(app).get('/api/metrics').set('Authorization', `Bearer ${token}`);
  }

  before(function () {
    app = createTestApp();
  });

  after(function () {
    closeTestApp();
  });

  it('0 | New user starts with empty metrics structure', async function () {
    const { token } = await registerAndLogin(app, 'met0');
    const res = await fetchMetrics(token);
    expect(res.status).to.equal(200);
    expect(res.body.goal).to.equal(0);
    expect(res.body.monthlyData).to.be.an('array').with.lengthOf(12);
    res.body.monthlyData.forEach(m => expect(m.totalWorkouts).to.equal(0));
  });

  it('1 | Set a valid annual workout goal.', async function () {
    const { token } = await registerAndLogin(app, 'met1');
    const res = await setGoal(token, 100);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.property('goal', 100);
  });

  it('2 | Set an invalid annual goal', async function () {
    const { token } = await registerAndLogin(app, 'met2');
    const res = await setGoal(token, -10);
    expect(res.status).to.equal(400);
  });

  describe('Single workout metric calculations (3-5)', function () {
    let token;
    let workout;

    before(async function () {
      ({ token } = await registerAndLogin(app, 'metcalc'));
      await setGoal(token, 200);
      workout = { day: randomDay(), month: currentMonth, year: currentYear };
      await addWorkout(token, workout);
    });

    it('3 | Calculate the total number of workouts completed in the current month', async function () {
      const res = await fetchMetrics(token);
      expect(res.status).to.equal(200);
      expect(res.body.totalMonth).to.equal(1);
      expect(res.body.monthlyData[currentMonth - 1].totalWorkouts).to.equal(1);
    });

    it('4 | Calculate total workouts completed in the year', async function () {
      const res = await fetchMetrics(token);
      expect(res.status).to.equal(200);
      expect(res.body.totalYear).to.equal(1);
    });

    it('5 | Calculate the percentage of workouts completed in relation to the annual goal', async function () {
      const res = await fetchMetrics(token);
      expect(res.status).to.equal(200);
      expect(res.body.percentage).to.equal(Math.round((1 / 200) * 100));
    });
  });

  it('6 | Update metrics when setting a workout', async function () {
    const { token } = await registerAndLogin(app, 'met6');
    await setGoal(token, 100);
    const day = randomDay();
    await addWorkout(token, { day, month: currentMonth, year: currentYear });
    await addWorkout(token, {
      day: day === 27 ? 28 : day + 1,
      month: currentMonth,
      year: currentYear,
    });
    const res = await fetchMetrics(token);
    expect(res.status).to.equal(200);
    expect(res.body.totalMonth).to.equal(2);
    expect(res.body.totalYear).to.equal(2);
    expect(res.body.monthlyData[currentMonth - 1].totalWorkouts).to.equal(2);
    expect(res.body.percentage).to.equal(Math.round((2 / 100) * 100));
  });

  it('7 | Update metrics when unsetting a workout', async function () {
    const { token } = await registerAndLogin(app, 'met7');
    await setGoal(token, 200);
    const day = randomDay();
    const w1 = { day, month: currentMonth, year: currentYear };
    const w2 = { day: day === 27 ? 28 : day + 1, month: currentMonth, year: currentYear };
    await addWorkout(token, w1);
    await addWorkout(token, w2);
    await request(app)
      .delete('/api/workouts/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send(w2);
    const res = await fetchMetrics(token);
    expect(res.status).to.equal(200);
    expect(res.body.totalMonth).to.equal(1);
    expect(res.body.totalYear).to.equal(1);
    expect(res.body.percentage).to.equal(Math.round((1 / 200) * 100));
  });

  it('8 | Display metrics only for authenticated users', async function () {
    const res = await request(app).get('/api/metrics');
    expect(res.status).to.equal(401);
  });
});
