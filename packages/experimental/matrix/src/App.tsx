//
// Copyright 2023 DXOS.org
//

import '@dxosTheme';

import { faker } from '@faker-js/faker';
import { BoundingBox, ChartPieSlice, ChartScatter, Image, Polygon, type Icon } from '@phosphor-icons/react';
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
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Input } from '@dxos/react-ui';
import { fixedInsetFlexLayout, groupBorder, inputSurface, mx } from '@dxos/react-ui-theme';

import { Matrix, type MatrixOptions } from './Matrix';

faker.seed(2);

// TODO(burdon): Context (forward) vs desk/table.
// TODO(burdon): Add stack; Add item; buttons.

// TODO(burdon): Allow viewing of two stacks at once.
// TODO(burdon): Surface/mosaic.
// TODO(burdon): Virtualize x.

type Data = {
  id: string;
  title: string;
  blocks?: string[];
  outline?: { done: boolean; text: string }[];
  image?: string;
};

type SectionType = 'text' | 'outline' | 'sketch';

const sectionTypes: SectionType[] = ['text', 'outline', 'sketch'];

const images: { [key: string]: Icon } = {
  chart: ChartScatter,
  pie: ChartPieSlice,
  polygon: Polygon,
  image: Image,
  box: BoundingBox,
};

const createSection = (type: SectionType): Partial<Data> => {
  switch (type) {
    case 'text':
      return {
        blocks: faker.helpers.multiple(() => faker.lorem.sentences(), { count: { min: 1, max: 8 } }),
      };
    case 'outline':
      return {
        outline: faker.helpers.multiple(
          () => ({
            done: faker.datatype.boolean(),
            text: faker.lorem.sentence(),
          }),
          { count: { min: 1, max: 8 } },
        ),
      };
    case 'sketch':
      return {
        image: faker.helpers.arrayElement(Object.keys(images)),
      };
  }
};

const createStacks = () =>
  faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      items: faker.helpers.multiple(
        () => ({
          id: faker.string.uuid(),
          title: faker.lorem.sentence(),
          ...createSection(
            faker.datatype.boolean({ probability: 0.6 })
              ? 'text'
              : faker.datatype.boolean({ probability: 0.6 })
              ? 'outline'
              : 'sketch',
          ),
        }),
        { count: 16 },
      ),
    }),
    { count: 4 },
  );

const ItemRenderer = ({ title, blocks, outline, image }: Data) => {
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
        {outline?.map(({ done, text }, i) => (
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

const KBarCustomResults = () => {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        if (typeof item === 'string') {
          return <div className='p-2 text-neutral-300 border-l-4 border-transparent'>{item}</div>;
        }

        // TODO(burdon): Render ancestors.
        //  https://github.com/timc1/kbar/blob/main/example/src/App.tsx
        const { name, shortcut } = item;
        return (
          <div
            className={mx(
              'flex w-full p-2 gap-4 border-l-4',
              active ? 'border-neutral-500 bg-neutral-50' : 'border-transparent',
            )}
          >
            <div className='w-full truncate cursor-pointer'>{name}</div>
            {shortcut && (
              <div className='flex gap-2'>
                {shortcut.map((key, i) => (
                  <kbd key={i} className='whitespace-nowrap text-xs text-neutral-400 mr-1'>
                    {key}
                  </kbd>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export const App = () => {
  const [options, setOptions] = useState<MatrixOptions>({ debug: false, animation: false });
  const [stacks, setStacks] = useState(createStacks());
  const [selected, setSelected] = useState<string | undefined>(stacks[0]?.id);
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // https://github.com/timc1/kbar#readme
  const actions = useMemo<Action[]>(() => {
    return [
      {
        id: 'stack-select',
        section: 'navigation',
        name: 'Select stack...',
      },
      ...stacks.map((stack, i) => ({
        id: stack.id,
        section: 'stacks',
        parent: 'stack-select',
        shortcut: [`^${i + 1}`],
        name: stack.title,
        perform: () => setSelected(stack.id),
      })),
      {
        id: 'section-insert',
        section: 'content',
        name: 'Insert section...',
        shortcut: ['Alt ⌘ I'],
      },
      ...sectionTypes.map((type) => ({
        id: `section-insert-${type}`,
        section: 'content',
        parent: 'section-insert',
        name: `Insert ${type}`,
        perform: () => {
          setStacks((stacks) => {
            return stacks.map((stack) => {
              if (stack.id === selectedRef.current) {
                const item = {
                  id: faker.string.uuid(),
                  title: faker.lorem.sentence(),
                  ...createSection(type),
                };

                // TODO(burdon): Insert in place?
                return { ...stack, items: [...stack.items, item] };
              }

              return stack;
            });
          });
        },
      })),
      {
        id: 'section-delete',
        section: 'content',
        name: 'Delete section',
      },
      {
        id: 'stack-create',
        section: 'content',
        shortcut: ['Alt ⌘ N'],
        name: 'Create stack',
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
        id: 'stack-delete',
        section: 'content',
        name: 'Delete stack',
        perform: () => {
          setStacks((stacks) => {
            const updated = stacks.filter((stack) => stack.id !== selectedRef.current);
            setSelected(updated.length ? updated[0].id : undefined);
            return updated;
          });
        },
      },
      {
        id: 'debug',
        section: 'utils',
        name: 'Toggle debug',
        perform: () => {
          setOptions((options) => ({ ...options, debug: !options?.debug }));
        },
      },
      {
        id: 'animation',
        section: 'utils',
        name: 'Toggle animation',
        perform: () => {
          setOptions((options) => ({ ...options, animation: !options?.animation }));
        },
      },
    ];
  }, [stacks]);

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator>
            <div className={mx(inputSurface, groupBorder, 'border shadow-lg w-[500px]')}>
              <KBarSearch className='w-full p-3 outline-none' />
              <KBarCustomResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>

      <div className={mx(fixedInsetFlexLayout, 'bg-neutral-100')}>
        <Matrix<Data>
          stacks={stacks}
          itemRenderer={ItemRenderer}
          selected={selected}
          options={options}
          onSelect={setSelected}
        />
      </div>
    </KBarProvider>
  );
};
