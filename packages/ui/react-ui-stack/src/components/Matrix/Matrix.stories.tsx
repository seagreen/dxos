//
// Copyright 2023 DXOS.org
//

import '@dxosTheme';

import { faker } from '@faker-js/faker';
import { ChartPie, ChartScatter, Polygon, type Icon } from '@phosphor-icons/react';
import React, { useState } from 'react';

import { Input } from '@dxos/react-ui';
import { fixedInsetFlexLayout, mx } from '@dxos/react-ui-theme';

import { Matrix } from './Matrix';

faker.seed(1);

// TODO(burdon): Command-K nav: https://www.npmjs.com/package/kbar.
// TODO(burdon): Context (forward) vs desk/table.
// TODO(burdon): Add stack; Add item; buttons.

// TODO(burdon): Allow viewing of two stacks at once.
// TODO(burdon): Surface/mosaic.
// TODO(burdon): Virtualize x.

const images: { [key: string]: Icon } = {
  chart: ChartScatter,
  pie: ChartPie,
  polygon: Polygon,
};

type Data = {
  id: string;
  title: string;
  blocks?: string[];
  bullets?: { done: boolean; text: string }[];
  image?: string;
};

const ItemRenderer = ({ title, blocks, bullets, image }: Data) => {
  const Image = image && images[image];

  return (
    <div className='flex flex-col gap-2'>
      <div className='text-lg'>{title}</div>
      <div className='flex flex-col gap-2 text-neutral-500'>
        {blocks?.map((block, i) => (
          <div key={i} className='w-full text-sm'>
            {block}
          </div>
        ))}
        {bullets?.map(({ done, text }, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Input.Root>
              <Input.Checkbox checked={done} />
            </Input.Root>
            {text}
          </div>
        ))}
        {Image && (
          <div className='flex justify-center'>
            <Image weight='thin' className='w-[300px] h-[300px]' />
          </div>
        )}
      </div>
    </div>
  );
};

const createStacks = () =>
  faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      items: faker.helpers.multiple(
        () => {
          const data: Data = {
            id: faker.string.uuid(),
            title: faker.lorem.sentence(),
          };

          if (faker.datatype.boolean({ probability: 0.7 })) {
            data.blocks = faker.helpers.multiple(() => faker.lorem.sentences(), { count: { min: 1, max: 8 } });
          } else if (faker.datatype.boolean({ probability: 0.4 })) {
            data.image = faker.helpers.arrayElement(Object.keys(images));
          } else {
            data.bullets = faker.helpers.multiple(
              () => ({
                done: faker.datatype.boolean(),
                text: faker.lorem.sentence(),
              }),
              { count: { min: 1, max: 8 } },
            );
          }

          return data;
        },
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
