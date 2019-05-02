import hello from './index';

test('Should append Hello before the name', () => {
  expect(hello('World')).toBe('Hello World');
});
