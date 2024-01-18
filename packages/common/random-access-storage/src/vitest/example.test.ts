import { test } from 'vitest';

test('global keys', () => {
  console.log(Object.keys(globalThis));
});
