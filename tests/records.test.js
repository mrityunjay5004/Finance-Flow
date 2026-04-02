const request = require('supertest');
const app = require('../src/server');
const db = require('./setup');
const User = require('../src/models/User');
const Record = require('../src/models/Record');

let adminToken, viewerToken;

beforeAll(async () => {
  await db.connect();

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@financeflow.com',
    password: 'Password123',
    role: 'admin'
  });

  const viewer = await User.create({
    name: 'Viewer',
    email: 'viewer@financeflow.com',
    password: 'Password123',
    role: 'viewer'
  });

  const getLogRes = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'Password123' });
  adminToken = getLogRes.body.token;

  const getViewLogRes = await request(app).post('/api/auth/login').send({ email: viewer.email, password: 'Password123' });
  viewerToken = getViewLogRes.body.token;
});

afterAll(async () => await db.close());

describe('Record API and RBAC', () => {
  let recordId;

  test('POST /api/records - admin can create - success', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 100,
        type: 'income',
        category: 'Salary',
        notes: 'Monthly pay'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.record.amount).toBe(100);
    recordId = res.body.record._id;
  });

  test('POST /api/records - viewer can NOT create - 403', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 50, type: 'expense', category: 'Food' });

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/records - success', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.records).toHaveLength(1);
  });

  test('DELETE /api/records/:id - admin can delete - success', async () => {
    const res = await request(app)
      .delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const checkRecord = await Record.findById(recordId);
    expect(checkRecord.isDeleted).toBe(true);
  });
});
