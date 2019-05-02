const { validateUsername } = require('../utils');

test('Should validate usernames', function() {
  expect(validateUsername('abc123ABC_')).toBe(true);
  expect(validateUsername('')).toBe(false);
  expect(validateUsername(null)).toBe(false);
  expect(validateUsername(undefined)).toBe(false);
  expect(validateUsername('$')).toBe(false);
});
