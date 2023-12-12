//
// Copyright 2023 DXOS.org
//

import '@dxosTheme';

import { faker } from '@faker-js/faker';

import { App } from './App';
import { Matrix } from './Matrix';

faker.seed(2);

export default {
  component: Matrix,
  render: App,
  layout: 'fullscreen',
};

export const Default = {};
