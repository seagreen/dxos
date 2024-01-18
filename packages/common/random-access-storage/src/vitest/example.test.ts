import { test } from 'vitest';
import { StorageType, createStorage } from '../browser';

test('global keys', () => {
  console.log(Object.keys(globalThis));
});

test('webfs', async () => {
  const storage = createStorage({ type: StorageType.WEBFS, root: 'test' });

  const file = storage.createDirectory('test').getOrCreateFile('test.txt');
  await file.write(0, Buffer.from('hello world'));
});
