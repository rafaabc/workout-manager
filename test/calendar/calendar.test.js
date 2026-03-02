import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
const baseURL = process.env.BASE_URL;

import { randomUsername, validPassword, randomDay } from '../testUtils.js';

// compute current month/year for tests
const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

let token, user, workout1, workout2;

describe("UR-2: Set workouts in the calendar", function () {
  it("5 | Set workout in a valid day", async function () {
    const user = { username: randomUsername("cal"), password: validPassword() };
    await request(baseURL).post("/api/users/register").send(user);
    const resLogin = await request(baseURL).post("/api/users/login").send(user);
    const token = resLogin.body.token;
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    const res = await request(baseURL)
      .post("/api/workouts/calendar")
      .set("Authorization", `Bearer ${token}`)
      .send(workout);
    expect([200, 201]).to.include(res.status);
    expect(res.body).to.have.property("message");
  });

  it("6 | Unset workout registered previously", async function () {
    const user = { username: randomUsername("cal"), password: validPassword() };
    await request(baseURL).post("/api/users/register").send(user);
    const resLogin = await request(baseURL).post("/api/users/login").send(user);
    const token = resLogin.body.token;
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post("/api/workouts/calendar")
      .set("Authorization", `Bearer ${token}`)
      .send(workout);
    const res = await request(baseURL)
      .delete("/api/workouts/calendar")
      .set("Authorization", `Bearer ${token}`)
      .send(workout);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message");
  });

  it("7 | Set workout in a day that already has a workout set", async function () {
    const user = { username: randomUsername("cal"), password: validPassword() };
    await request(baseURL).post("/api/users/register").send(user);
    const resLogin = await request(baseURL).post("/api/users/login").send(user);
    const token = resLogin.body.token;
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post("/api/workouts/calendar")
      .set("Authorization", `Bearer ${token}`)
      .send(workout);
    const res = await request(baseURL)
      .post("/api/workouts/calendar")
      .set("Authorization", `Bearer ${token}`)
      .send(workout);
    expect([400]).to.include(res.status);
  });

  it("9 | Data persistence after logout and new login", async function () {
    const user = { username: randomUsername("cal"), password: validPassword() };
    await request(baseURL).post("/api/users/register").send(user);
    const resLogin = await request(baseURL).post("/api/users/login").send(user);
    const token = resLogin.body.token;
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post("/api/workouts/calendar")
      .set("Authorization", `Bearer ${token}`)
      .send(workout);
    // Logout
    await request(baseURL)
      .post("/api/users/logout")
      .set("Authorization", `Bearer ${token}`);
    // Novo login
    const resLogin2 = await request(baseURL)
      .post("/api/users/login")
      .send(user);
    const newToken = resLogin2.body.token;
    // Verificar workout
    const res = await request(baseURL)
      .get(`/api/workouts/calendar?month=${workout.month}&year=${workout.year}`)
      .set("Authorization", `Bearer ${newToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.some((t) => t.day === workout.day)).to.be.true;
  });

  it("10 | Workout registration linked to authenticated user", async function () {
    const user1 = {
      username: randomUsername("cal1"),
      password: validPassword(),
    };
    const user2 = {
      username: randomUsername("cal2"),
      password: validPassword(),
    };
    await request(baseURL).post("/api/users/register").send(user1);
    await request(baseURL).post("/api/users/register").send(user2);
    const resLogin1 = await request(baseURL)
      .post("/api/users/login")
      .send(user1);
    const resLogin2 = await request(baseURL)
      .post("/api/users/login")
      .send(user2);
    const token1 = resLogin1.body.token;
    const token2 = resLogin2.body.token;
    const workout = { day: randomDay(), month: currentMonth, year: currentYear };
    await request(baseURL)
      .post("/api/workouts/calendar")
      .set("Authorization", `Bearer ${token2}`)
      .send(workout);
    const res = await request(baseURL)
      .get(`/api/workouts/calendar?month=${workout.month}&year=${workout.year}`)
      .set("Authorization", `Bearer ${token1}`);
    expect(res.status).to.equal(200);
    expect(res.body.filter((t) => t.day === workout.day).length).to.be.at.most(
      1,
    );
  });
});
