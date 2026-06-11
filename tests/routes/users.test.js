const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const config = require('../../config');

jest.mock('../../models/User');
jest.mock('bcrypt');

const UserModel = require('../../models/User');
const bcrypt = require('bcrypt');

function makeToken(overrides = {}) {
  return jwt.sign({ _id: 'fakeid', name: 'Tester', isAdmin: false, ...overrides }, config.secret);
}

beforeEach(() => {
  jest.clearAllMocks();
  bcrypt.genSalt.mockResolvedValue('salt');
  bcrypt.hash.mockResolvedValue('hashed_password');
});

// ---------------------------------------------------------------------------
// GET /api/users
// ---------------------------------------------------------------------------
describe('GET /api/users', () => {
  it('returns 200 with a list of users', async () => {
    UserModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: 'id1', name: 'Bob', isActive: true }]),
    });

    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('calls select("-password -email") to strip sensitive fields from the response', async () => {
    const selectMock = jest.fn().mockResolvedValue([]);
    UserModel.find.mockReturnValue({ select: selectMock });

    await request(app).get('/api/users');
    expect(selectMock).toHaveBeenCalledWith('-password -email');
  });
});

// ---------------------------------------------------------------------------
// POST /api/users
// ---------------------------------------------------------------------------
describe('POST /api/users', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/users').send({ password: 'abc123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/users').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  it('creates a user and returns 200 with the saved document', async () => {
    const savedUser = { _id: 'newid', name: 'Carol', email: 'carol@example.com', isActive: true };
    UserModel.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(savedUser) }));

    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Carol', email: 'carol@example.com', password: 'pass123' });

    expect(res.status).toBe(200);
  });

  it('hashes the password with bcrypt before saving', async () => {
    UserModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ _id: 'id', email: 'dave@example.com' }),
    }));

    await request(app)
      .post('/api/users')
      .send({ email: 'dave@example.com', password: 'mySecret' });

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('mySecret', 'salt');
  });

  it('returns 400 when save throws (e.g. duplicate email)', async () => {
    UserModel.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('E11000 duplicate key')),
    }));

    const res = await request(app)
      .post('/api/users')
      .send({ email: 'dupe@example.com', password: 'abc' });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/users/:id
// ---------------------------------------------------------------------------
describe('PUT /api/users/:id', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).put('/api/users/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });

  it('returns 200 but sends JWT payload instead of updated user (documents early-return bug)', async () => {
    const token = makeToken({ _id: 'fakeid', name: 'Tester' });
    const res = await request(app)
      .put('/api/users/507f1f77bcf86cd799439011')
      .set('x-auth-token', token)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    // BUG: route has `return res.send(req.user)` on line 44, so it returns
    // the decoded JWT payload instead of the updated user document.
    expect(res.body.name).toBe('Tester');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/users/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/users/:id', () => {
  const TARGET_ID = '507f1f77bcf86cd799439011';

  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).delete(`/api/users/${TARGET_ID}`);
    expect(res.status).toBe(401);
  });

  it('returns 403 when the caller is not an admin', async () => {
    const res = await request(app)
      .delete(`/api/users/${TARGET_ID}`)
      .set('x-auth-token', makeToken({ isAdmin: false }));

    expect(res.status).toBe(403);
  });

  it('deletes the user and returns 200 when called by an admin', async () => {
    UserModel.findByIdAndRemove.mockResolvedValue({ _id: TARGET_ID, name: 'Eve' });

    const res = await request(app)
      .delete(`/api/users/${TARGET_ID}`)
      .set('x-auth-token', makeToken({ isAdmin: true }));

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(TARGET_ID);
    expect(UserModel.findByIdAndRemove).toHaveBeenCalledWith(TARGET_ID);
  });
});
