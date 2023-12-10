//
// Copyright 2023 DXOS.org
//

// import { useArrowNavigationGroup } from '@fluentui/react-tabster';
import React, { type KeyboardEvent, useEffect, useRef, useState } from 'react';

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

/**
 * Row of Stacks.
 */
export const Matrix = <T extends Item>({ stacks = [], itemRenderer }: MatrixProps<T>) => {
  const [selected, setSelected] = useState<string>();
  // const domAttributes = useArrowNavigationGroup({ axis: 'grid' });

  const handleBack = () => {
    const idx = stacks.findIndex((stack) => stack.id === selected);
    if (idx > 0) {
      setSelected(stacks[idx - 1].id);
    }
  };

  const handleForward = () => {
    const idx = stacks.findIndex((stack) => stack.id === selected);
    if (idx < stacks.length - 1) {
      setSelected(stacks[idx + 1].id);
    }
  };

  return (
    <div className='flex grow overflow-hidden'>
      <div className='flex overflow-x-scroll gap-[200px] snap-x px-[800px] p-4'>
        {stacks.map((stack) => (
          <Stack<T>
            key={stack.id}
            stack={stack}
            selected={selected === stack.id}
            onSelect={() => setSelected(stack.id)}
            onBack={handleBack}
            onForward={handleForward}
            classNames='w-[800px]'
            itemRenderer={itemRenderer}
          />
        ))}
      </div>
    </div>
  );
};

export type ItemRenderer<T extends Item> = (item: T) => JSX.Element;

export type StackProps<T extends Item> = {
  classNames?: string;
  stack: Stack<T>;
  selected?: boolean;
  onSelect?: () => void;
  onBack?: () => void;
  onForward?: () => void;
  itemRenderer?: ItemRenderer<T>;
};

/**
 * Stack of items.
 */
export const Stack = <T extends Item>({
  classNames,
  stack,
  selected: _selected,
  onSelect,
  onBack,
  onForward,
  itemRenderer,
}: StackProps<T>) => {
  const ref = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(_selected);
  const [itemSelected, setItemSelected] = useState<string>();

  useEffect(() => {
    setSelected(_selected);
    if (_selected) {
      ref.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  }, [ref, selected, _selected]);

  useEffect(() => {
    if (itemSelected) {
      itemRef.current?.focus();
    }
  }, [itemRef, itemSelected]);

  useEffect(() => {
    if (selected && !itemSelected) {
      setItemSelected(stack.items[0]?.id);
    }
  }, [stack, selected]);

  // TODO(burdon): Select.

  const handleSelect = (item: Item, target?: Element) => {
    setItemSelected(item.id);
    if (!selected) {
      onSelect?.();
    }
  };

  const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    const idx = stack.items.findIndex((item) => item.id === itemSelected);
    switch (ev.key) {
      case 'ArrowUp':
        if (idx > 0) {
          setItemSelected(stack.items[idx - 1].id);
        }
        break;
      case 'ArrowDown':
        if (idx < stack.items.length - 1) {
          setItemSelected(stack.items[idx + 1].id);
        }
        break;
      case 'ArrowLeft':
        onBack?.();
        break;
      case 'ArrowRight':
        onForward?.();
        break;
    }
  };

  return (
    <div
      ref={ref}
      className={mx(
        'flex flex-col shrink-0 grow m-1 overflow-hidden border rounded px-16 snap-center',
        groupSurface,
        selected && 'ring ring-neutral-200',
        classNames,
      )}
    >
      <div className={mx('flex shrink-0 px-6 my-4 items-center gap-4 cursor-pointer')} onClick={() => onSelect?.()}>
        <div className='grow truncate text-lg'>{stack.title}</div>
        <div className='text-xs text-neutral-500'>{stack.id.slice(0, 8)}</div>
      </div>

      <List classNames='flex flex-col w-full gap-2 overflow-y-scroll'>
        {stack.items.map((item) => (
          <ListItem.Root key={item.id} onClick={() => handleSelect(item)}>
            <input
              className='w-2 h-2 __opacity-0'
              onKeyDown={handleKeyDown}
              onFocus={(event) => {
                // TODO(burdon): Jumps if scrolling up.
                event.target.scrollIntoView({ behavior: selected ? 'instant' : 'instant', block: 'start' });
                handleSelect(item);
              }}
              ref={itemSelected === item.id ? itemRef : undefined}
            />
            <div
              className={mx(
                'flex flex-col mx-4 my-1 px-10 py-4 border rounded',
                itemSelected === item.id && (selected ? 'ring' : 'border border-neutral-500'),
                inputSurface,
              )}
            >
              <div>{itemRenderer?.(item)}</div>
              <div className='mt-4 text-xs text-neutral-500'>{item.id}</div>
            </div>
          </ListItem.Root>
        ))}
      </List>
    </div>
  );
};
