//
// Copyright 2023 DXOS.org
//

import '@dxosTheme';

import { faker } from '@faker-js/faker';
import { ChartPieSlice, ChartScatter, Image, Polygon, type Icon } from '@phosphor-icons/react';
import {
  type Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useMatches,
} from 'kbar';
import React, { useMemo, useState } from 'react';

import { Input } from '@dxos/react-ui';
import { fixedInsetFlexLayout, groupBorder, inputSurface, mx } from '@dxos/react-ui-theme';

import { Matrix } from './Matrix';

faker.seed(1);

// TODO(burdon): Context (forward) vs desk/table.
// TODO(burdon): Add stack; Add item; buttons.

// TODO(burdon): Allow viewing of two stacks at once.
// TODO(burdon): Surface/mosaic.
// TODO(burdon): Virtualize x.

const images: { [key: string]: Icon } = {
  chart: ChartScatter,
  pie: ChartPieSlice,
  polygon: Polygon,
  image: Image,
};

type Data = {
  id: string;
  title: string;
  blocks?: string[];
  bullets?: { done: boolean; text: string }[];
  image?: string;
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
            <Image weight='thin' className='w-[400px] h-[400px] text-neutral-300' />
          </div>
        )}
      </div>
    </div>
  );
};

const RenderResults = () => {
  const { results } = useMatches();

  return (
    <div className='shadow rounded'>
      <KBarResults
        items={results}
        onRender={({ item, active }) => {
          const { name, shortcut } = item as Action;

          return (
            <div
              className={mx(
                'flex w-full px-2 py-1 gap-4 border-l-4',
                active ? 'border-neutral-500 bg-neutral-50' : 'border-transparent',
              )}
            >
              <div className='w-full truncate'>{name}</div>
              <div className='text-neutral-400'>{shortcut}</div>
            </div>
          );
        }}
      />
    </div>
  );
};

const Story = () => {
  const [stacks, setStacks] = useState(createStacks());
  const [selected, setSelected] = useState<string>();

  // https://github.com/timc1/kbar#readme
  const actions = useMemo<Action[]>(() => {
    return [
      {
        id: 'stack',
        shortcut: ['s'],
        name: 'Select stack...',
      },
      {
        id: 'stack-create',
        shortcut: ['c'],
        name: 'Create stack...',
        perform: () => {
          const stack = {
            id: faker.string.uuid(),
            title: faker.lorem.sentence(),
            items: [
              {
                id: faker.string.uuid(),
                title: faker.lorem.sentence(),
              },
            ],
          };
          setStacks((stacks) => [...stacks, stack]);
          setSelected(stack.id);
        },
      },
      {
        id: 'help',
        shortcut: ['h'],
        name: 'Help',
        perform: () => {},
      },
      ...stacks.map((stack, i) => ({
        id: stack.id,
        parent: 'stack',
        shortcut: [String(i + 1)],
        name: stack.title,
        perform: () => setSelected(stack.id),
      })),
    ];
  }, [stacks]);

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator>
            <div className={mx(inputSurface, groupBorder, 'border shadow w-[500px]')}>
              <KBarSearch className='w-full p-3 outline-none' />
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>

      <div className={mx(fixedInsetFlexLayout, 'bg-neutral-100')}>
        <Matrix<Data> stacks={stacks} selected={selected} itemRenderer={ItemRenderer} />
      </div>
    </KBarProvider>
  );
};

export default {
  component: Matrix,
  render: Story,
  layout: 'fullscreen',
};

export const Default = {};
