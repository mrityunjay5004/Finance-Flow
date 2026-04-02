const request = require('supertest');
const app = require('../src/server');
const db = require('./setup');
const User = require('../src/models/User');

beforeAll(async () => await db.connect());
afterAll(async () => await db.close());
afterEach(async () => await db.clear());

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test Admin',
    email: 'admin@financeflow.com',
    password: 'Password123'
  };

  test('POST /api/auth/register - success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/register - email already in use', async () => {
    await User.create(testUser);
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - success', async () => {
    await User.create(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  test('GET /api/auth/me - success', async () => {
    const user = await User.create(testUser);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });
});
