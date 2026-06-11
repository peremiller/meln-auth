const UserModel = require('../../models/User');

// Mongoose runs schema validators client-side via validateSync(),
// so these tests need no DB connection.
describe('User model validation', () => {
  it('passes validation with all required fields present', () => {
    const user = new UserModel({ name: 'Frank', email: 'frank@example.com', password: 'hashed' });
    const error = user.validateSync();
    expect(error).toBeUndefined();
  });

  it('fails when email is missing', () => {
    const user = new UserModel({ name: 'Ghost', password: 'hashed' });
    const error = user.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('fails when password is missing', () => {
    const user = new UserModel({ email: 'ghost@example.com' });
    const error = user.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('passes validation when optional fields (name, isActive, isAdmin) are omitted', () => {
    const user = new UserModel({ email: 'minimal@example.com', password: 'hashed' });
    const error = user.validateSync();
    expect(error).toBeUndefined();
  });
});
