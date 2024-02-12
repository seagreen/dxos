import { test } from 'vitest';
import { Repo, type DocHandleChangePayload } from '@dxos/automerge/automerge-repo';
import { AutomergeIndex } from './automerge-index';

export type TestDoc = {
  category: string;
};

test('progresses hashes', () => {
  const index = new AutomergeIndex<TestDoc>({ dbName: 'test_' + crypto.randomUUID() });
  const repo = new Repo({ network: [] });
  const handle = repo.create();
  handle.on('change', (event: DocHandleChangePayload<TestDoc>) => {
    index.update(event);
  });
});
