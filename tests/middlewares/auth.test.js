const jwt = require('jsonwebtoken');
const config = require('../../config');
const authMiddleware = require('../../middlewares/auth');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('auth middleware', () => {
  it('returns 401 when no token is provided', () => {
    const req = { header: () => undefined };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Access denied. No token provided');
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when token is invalid', () => {
    const req = { header: () => 'invalid.token.here' };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid token.');
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and sets req.user for a valid token', () => {
    const payload = { _id: '507f1f77bcf86cd799439011', name: 'Alice', isAdmin: false };
    const token = jwt.sign(payload, config.secret);
    const req = { header: () => token };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(payload);
  });

  it('sets all JWT fields on req.user', () => {
    const payload = { _id: 'abc', name: 'Bob', isAdmin: true };
    const token = jwt.sign(payload, config.secret);
    const req = { header: () => token };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user._id).toBe('abc');
    expect(req.user.name).toBe('Bob');
    expect(req.user.isAdmin).toBe(true);
  });
});
