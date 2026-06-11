const adminMiddleware = require('../../middlewares/admin');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('admin middleware', () => {
  it('returns 403 when user is not admin', () => {
    const req = { user: { isAdmin: false } };
    const res = mockRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Access Denied');
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when user is admin', () => {
    const req = { user: { isAdmin: true } };
    const res = mockRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('throws when req.user is undefined (documents crash bug)', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    // BUG: admin middleware does not guard against missing req.user
    expect(() => adminMiddleware(req, res, next)).toThrow();
  });
});
