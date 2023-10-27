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
import { EsbuildExecutorOptions } from './bundle';

export default async function *(
  taskGraph: TaskGraph,
  inputs: Record<string, EsbuildExecutorOptions>,
  overrides: EsbuildExecutorOptions,
  context: ExecutorContext,
) {
 console.log({
  inputs,
  overrides,
  context,
  taskGraph
 }) 
};
