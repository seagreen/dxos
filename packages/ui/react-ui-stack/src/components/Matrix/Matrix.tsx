//
// Copyright 2023 DXOS.org
//

import React from 'react';

import { List, ListItem } from '@dxos/react-ui';
import { groupSurface, inputSurface, mx } from '@dxos/react-ui-theme';

export type Item = {
  id: string;
};

export type Stack<T extends Item> = {
  id: string;
  title: string;
  items: T[];
};

export type MatrixProps<T extends Item> = {
  stacks?: Stack<T>[];
} & Pick<StackProps<T>, 'itemRenderer'>;

// TODO(burdon): Virtualize
export const Matrix = <T extends Item>({ stacks = [], itemRenderer }: MatrixProps<T>) => {
  return (
    <div className='flex grow overflow-hidden m-4'>
      <div className='flex overflow-x-scroll gap-[200px] snap-x px-[800px]'>
        {stacks.map((stack) => (
          <Stack<T> key={stack.id} stack={stack} classNames='w-[800px]' itemRenderer={itemRenderer} />
        ))}
      </div>
    </div>
  );
};

// TODO(burdon): Use surfaces and mosaic.
export type ItemRenderer<T extends Item> = (item: T) => JSX.Element;

export type StackProps<T extends Item> = {
  classNames?: string;
  stack: Stack<T>;
  itemRenderer?: ItemRenderer<T>;
};

// TODO(burdon): Virtualize
export const Stack = <T extends Item>({ classNames, stack, itemRenderer }: StackProps<T>) => {
  return (
    <div
      className={mx(
        'flex flex-col shrink-0 grow h-full overflow-hidden border rounded px-16 snap-center',
        groupSurface,
        classNames,
      )}
    >
      <div className='flex shrink-0 px-10 py-4'>{stack.title}</div>
      <List classNames='flex flex-col w-full gap-4 overflow-y-scroll'>
        {stack.items.map((item) => (
          <ListItem.Root key={item.id} classNames={mx('px-10 py-4 border rounded', inputSurface)}>
            {itemRenderer?.(item)}
          </ListItem.Root>
        ))}
      </List>
    </div>
  );
};
