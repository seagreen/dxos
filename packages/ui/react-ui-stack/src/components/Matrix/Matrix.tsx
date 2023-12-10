//
// Copyright 2023 DXOS.org
//

// import { useArrowNavigationGroup } from '@fluentui/react-tabster';
import { Article, DotsThreeVertical } from '@phosphor-icons/react';
import React, { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { Button, DensityProvider, List, ListItem } from '@dxos/react-ui';
import { getSize, inputSurface, mx } from '@dxos/react-ui-theme';

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
  debug?: boolean;
} & Pick<StackProps<T>, 'itemRenderer'>;

/**
 * Row of Stacks.
 */
export const Matrix = <T extends Item>({ stacks = [], itemRenderer, debug = false }: MatrixProps<T>) => {
  // const domAttributes = useArrowNavigationGroup({ axis: 'grid' });

  const [selected, setSelected] = useState<string>();
  useEffect(() => {
    if (!selected && stacks.length) {
      setSelected(stacks[0].id);
    }
  }, []);

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
      <div className='flex overflow-x-scroll snap-x py-4 gap-40'>
        <div className='flex shrink-0 w-[800px]' />
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
            debug={debug}
          />
        ))}
        <div className='flex shrink-0 w-[800px]' />
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
  debug?: boolean;
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
  debug,
}: StackProps<T>) => {
  const ref = useRef<HTMLDivElement>(null);

  // Is stack selected.
  const [selected, setSelected] = useState(_selected);
  useEffect(() => {
    setSelected(_selected);
  }, [ref, _selected]);

  // Item selected.
  const [itemSelected, setItemSelected] = useState<string>();
  useEffect(() => {
    // Set first.
    if (selected && !itemSelected) {
      setItemSelected(stack.items[0]?.id);
    }
  }, [stack, selected]);

  const handleSelect = (item: Item) => {
    setItemSelected(item.id);
    if (!selected) {
      onSelect?.();
    }
  };

  const handleNavigate: SectionProps<T>['onNavigate'] = (direction) => {
    const idx = stack.items.findIndex((item) => item.id === itemSelected);
    switch (direction) {
      case 'up':
        if (idx > 0) {
          setItemSelected(stack.items[idx - 1].id);
        }
        break;
      case 'down':
        if (idx < stack.items.length - 1) {
          setItemSelected(stack.items[idx + 1].id);
        }
        break;
      case 'left':
        onBack?.();
        break;
      case 'right':
        onForward?.();
        break;
    }
  };

  return (
    <DensityProvider density='fine'>
      <div
        ref={ref}
        className={mx(
          'flex flex-col shrink-0 grow my-1 overflow-hidden shadow rounded snap-center',
          inputSurface,
          selected ? 'opacity-100' : 'opacity-50',
          classNames,
        )}
      >
        <div
          className={mx('flex shrink-0 my-4 items-center gap-4 cursor-pointer border-x-4 border-transparent')}
          onClick={() => onSelect?.()}
        >
          <div className='flex shrink-0 flex-row-reverse w-16'>
            <Article className={mx(getSize(5), 'text-neutral-500')} />
          </div>
          <div className='grow truncate text-lg'>{stack.title}</div>
          {debug && <div className='text-xs text-neutral-200 font-thin'>{stack.id.slice(0, 8)}</div>}
          <div className='flex shrink-0 flex-row-reverse w-16 pr-1'>
            <Button variant='ghost'>
              <DotsThreeVertical className={mx(getSize(5), 'text-neutral-500')} />
            </Button>
          </div>
        </div>

        <List classNames='flex flex-col w-full gap-2 divide-y overflow-y-scroll'>
          {stack.items.map((item) => (
            <Section
              key={item.id}
              item={item}
              itemRenderer={itemRenderer}
              active={selected}
              selected={itemSelected === item.id}
              onSelect={() => handleSelect(item)}
              onNavigate={handleNavigate}
              debug={debug}
            />
          ))}
        </List>
      </div>
    </DensityProvider>
  );
};

export type SectionProps<T extends Item> = {
  item: T;
  itemRenderer?: ItemRenderer<T>;
  active?: boolean; // Stack is active.
  selected?: boolean;
  onSelect?: () => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  debug?: boolean;
};

/**
 * Section.
 */
export const Section = <T extends Item>({
  item,
  itemRenderer,
  active,
  selected,
  onSelect,
  onNavigate,
  debug,
}: SectionProps<T>) => {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (focused) {
      onSelect?.();
      ref.current?.scrollIntoView({ behavior: active ? 'smooth' : 'instant', block: 'start', inline: 'center' });
    }
  }, [focused]);
  useEffect(() => {
    if (active && selected) {
      ref.current?.focus({ preventScroll: true });
      setFocused(true);
    }
  }, [ref, active, selected]);

  const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    switch (ev.key) {
      case 'ArrowUp':
        onNavigate?.('up');
        break;
      case 'ArrowDown':
        onNavigate?.('down');
        break;
      case 'ArrowLeft':
        onNavigate?.('left');
        break;
      case 'ArrowRight':
        onNavigate?.('right');
        break;
    }
  };

  return (
    <ListItem.Root key={item.id} classNames='flex flex-col' onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        className='w-full h-1 opacity-0'
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div
        className={mx(
          'flex flex-col my-1 py-4 border-l-4 border-transparent',
          focused ? 'border-blue-300' : selected && 'border-neutral-200',
          inputSurface,
        )}
      >
        <div className='flex'>
          <div className='flex shrink-0 flex-row-reverse w-20' />
          <div className='flex flex-col w-full'>
            {itemRenderer?.(item)}
            {debug && (
              <div className='mt-4 text-xs text-neutral-200 font-thin'>
                {JSON.stringify({ id: item.id.slice(0, 8), active, selected, focused })}
              </div>
            )}
          </div>
          <div className='flex shrink-0 flex-row-reverse w-20 pr-2'>
            <div>
              <Button variant='ghost'>
                <DotsThreeVertical className={mx(getSize(5), 'text-neutral-500')} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ListItem.Root>
  );
};
