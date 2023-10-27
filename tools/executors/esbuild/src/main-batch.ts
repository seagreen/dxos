//
// Copyright 2022 DXOS.org
//

import type { ExecutorContext, TaskGraph } from '@nx/devkit';
import { build, type Format, type Platform } from 'esbuild';
import RawPlugin from 'esbuild-plugin-raw';
import { yamlPlugin } from 'esbuild-plugin-yaml';
import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { bundleDepsPlugin } from './bundle-deps-plugin';
import { fixRequirePlugin } from './fix-require-plugin';
import { LogTransformer } from './log-transform-plugin';
import { EsbuildExecutorOptions, bundle } from './bundle';

type BatchExecutorTaskResult = {
  task: string;
  result: {
    success: boolean;
    terminalOutput: string;
    startTime: number;
    endTime: number;
  };
};

export default async function* (
  taskGraph: TaskGraph,
  inputs: Record<string, EsbuildExecutorOptions>,
  overrides: EsbuildExecutorOptions,
  context: ExecutorContext,
) {
  let tasks: { key: string; promise: Promise<BatchExecutorTaskResult> }[] = [];
  for (const [key, options] of Object.entries(inputs)) {
    const startTime = Date.now();
    const combinedOptions = { ...options, ...overrides };
    const promise = bundle(combinedOptions, { ...context, projectName: taskGraph.tasks[key].target.project }).then(
      (result): BatchExecutorTaskResult => ({
        task: key,
        result: {
          startTime,
          endTime: Date.now(),
          success: true,
          terminalOutput: '',
        },
      }),
      (error): BatchExecutorTaskResult => ({
        task: key,
        result: {
          startTime,
          endTime: Date.now(),
          success: false,
          terminalOutput: error.toString(),
        },
      }),
    );
    tasks.push({
      key,
      promise,
    });
  }

  while (tasks.length > 0) {
    const completed = await Promise.race(tasks.map((t) => t.promise));
    tasks = tasks.filter((t) => t.key !== completed.task);
    yield completed;
  }
}
