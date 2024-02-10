//
// Copyright 2024 DXOS.org
//

import { defineProject, mergeConfig } from 'vitest/config';

// import configShared from '../../../../vitest.shared';

// console.log(process.cwd());

export default // configShared,
defineProject({
  root: process.cwd(),
  test: {
    coverage: {
      enabled: false,
    },
    reporters: ['verbose'],
    cache: false,
    include: [`packages/core/echo/automerge-index/src/sanity.test.ts`],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.nx/**'],
    name: 'automerge-index',
    root: '.',
    dir: '.',
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
      isolate: false,
    },
    testTimeout: 999999999999,
  },
});
