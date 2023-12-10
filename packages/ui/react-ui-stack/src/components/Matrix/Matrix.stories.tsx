//
// Copyright 2023 DXOS.org
//

import '@dxosTheme';

import { faker } from '@faker-js/faker';
import React, { useState } from 'react';

import { fixedInsetFlexLayout, mx } from '@dxos/react-ui-theme';

import { Matrix } from './Matrix';

faker.seed(1);

// TODO(burdon): Key nav x/y (tabster) with hightlight of focus.

// TODO(burdon): Mock block sections with bullets and images.
// TODO(burdon): Command-K nav: https://www.npmjs.com/package/kbar.

// TODO(burdon): Context (forward).
// TODO(burdon): Virtualize x.
// TODO(burdon): Add stack; Add item.
// TODO(burdon): Allow viewing of two stacks at once.
// TODO(burdon): Surface/mosaic.

type Data = {
  id: string;
  title: string;
  blocks: string[];
};

const ItemRenderer = ({ title, blocks }: Data) => (
  <div className='flex flex-col gap-2'>
    <div className='text-lg'>{title}</div>
    <div className='flex flex-col gap-2 text-neutral-500'>
      {blocks.map((block, i) => (
        <div key={i} className='w-full text-sm'>
          {block}
        </div>
      ))}
    </div>
  </div>
);

const createStacks = () =>
  faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      items: faker.helpers.multiple(
        () => ({
          id: faker.string.uuid(),
          title: faker.lorem.sentence(),
          blocks: faker.helpers.multiple(() => faker.lorem.sentences(), { count: { min: 1, max: 8 } }),
        }),
        { count: 16 },
      ),
    }),
    { count: 4 },
  );

export default {
  component: Matrix,
  render: () => {
    const [stacks] = useState(createStacks());
    return (
      <div className={mx(fixedInsetFlexLayout, 'bg-neutral-100')}>
        <Matrix<Data> stacks={stacks} itemRenderer={ItemRenderer} />
      </div>
    );
  },
  layout: 'fullscreen',
};

export const Default = {};
