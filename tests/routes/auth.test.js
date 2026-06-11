const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const config = require('../../config');

jest.mock('../../models/User');
jest.mock('bcrypt');

const UserModel = require('../../models/User');
const bcrypt = require('bcrypt');

const MOCK_USER = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Alice',
  email: 'alice@example.com',
  password: 'hashed_password',
  isAdmin: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth', () => {
  it('returns 400 when email is not found in the database', async () => {
    UserModel.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password does not match', async () => {
    UserModel.findOne.mockResolvedValue(MOCK_USER);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(400);
  });

  it('returns 200 with a valid JWT in x-auth-token on correct credentials', async () => {
    UserModel.findOne.mockResolvedValue(MOCK_USER);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.headers['x-auth-token']).toBeDefined();
  });

  it('JWT payload contains _id, name, and isAdmin but not password', async () => {
    UserModel.findOne.mockResolvedValue(MOCK_USER);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'alice@example.com', password: 'password123' });

    const decoded = jwt.verify(res.headers['x-auth-token'], config.secret);
    expect(decoded._id).toBe(MOCK_USER._id);
    expect(decoded.name).toBe('Alice');
    expect(decoded.isAdmin).toBe(false);
    expect(decoded.password).toBeUndefined();
  });

  it('uses the same error message for wrong email and wrong password (prevents user enumeration)', async () => {
    UserModel.findOne.mockResolvedValueOnce(null);
    const wrongEmail = await request(app)
      .post('/api/auth')
      .send({ email: 'nobody@example.com', password: 'password123' });

    UserModel.findOne.mockResolvedValueOnce(MOCK_USER);
    bcrypt.compare.mockResolvedValue(false);
    const wrongPassword = await request(app)
      .post('/api/auth')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(wrongEmail.text).toBe(wrongPassword.text);
  });
});
