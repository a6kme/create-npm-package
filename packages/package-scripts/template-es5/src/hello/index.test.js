var hello = require('.');

test('Should append Hello before the name', function() {
  expect(hello('World')).toBe('Hello World');
});
