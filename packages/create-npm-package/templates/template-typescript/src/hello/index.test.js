const hello = require('./index').default;

test('Should append Hello before the name', () => {
  expect(hello('World')).toBe('Hello World');
});
