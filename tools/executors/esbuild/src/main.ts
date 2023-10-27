//
// Copyright 2022 DXOS.org
//

import type { ExecutorContext } from '@nx/devkit';

import { bundle, EsbuildExecutorOptions } from './bundle';


export default async (options: EsbuildExecutorOptions, context: ExecutorContext): Promise<{ success: boolean }> => {
  return await bundle(options, context);
};
