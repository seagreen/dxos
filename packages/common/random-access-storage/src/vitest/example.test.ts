import { test } from 'vitest';
import { StorageType, createStorage } from '..';

test('global keys', () => {
  // console.log(Object.keys(globalThis));
});

test.skip('nodefs', () => {
  const storage = createStorage({ type: StorageType.NODE, root: 'test' });

  const file = storage.createDirectory('test').getOrCreateFile('test.txt');
  file.write(0, Buffer.from('hello world'));
});

test('webfs', async () => {
  const storage = createStorage({ type: StorageType.WEBFS, root: '/tmp/vitest' + Math.random().toString() });

  const file = storage.createDirectory('test').getOrCreateFile('test.txt');
  await file.write(0, Buffer.from('hello world'));
});
