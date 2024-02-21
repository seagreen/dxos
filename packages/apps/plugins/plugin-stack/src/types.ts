//
// Copyright 2023 DXOS.org
//

import * as S from '@effect/schema/Schema';
import type { IconProps } from '@phosphor-icons/react';
import type { DeepSignal } from 'deepsignal/react';
import { Effect } from 'effect';
import type { FC } from 'react';

import { type Stack as StackType } from '@braneframe/types';
import type {
  GraphBuilderProvides,
  Intent,
  IntentResolverProvides,
  MetadataRecordsProvides,
  SettingsProvides,
  SurfaceProvides,
  TranslationsProvides,
} from '@dxos/app-framework';
import { StackItem } from '@dxos/react-ui-stack';

import { STACK_PLUGIN } from './meta';

const STACK_ACTION = `${STACK_PLUGIN}/action`;
export enum StackAction {
  CREATE = `${STACK_ACTION}/create`,
}

// TODO(wittjosiah): Creators/choosers likely aren't stack-specific.
//   Also distinct from graph actions though, output should be inserted into current view rather than navigated to.
type StackSectionAction = {
  id: string;
  testId: string;
  label: string | [string, { ns: string }];
  icon: FC<IconProps>;
};

export type StackSectionCreator = StackSectionAction & {
  intent: Intent | Intent[];
};

export type StackProvides = {
  stack: {
    creators?: StackSectionCreator[];
  };
};

export type StackState = DeepSignal<{
  creators: StackSectionCreator[];
}>;

export type StackSettingsProps = { separation: boolean };

export type StackPluginProvides = SurfaceProvides &
  IntentResolverProvides &
  GraphBuilderProvides &
  MetadataRecordsProvides &
  SettingsProvides<StackSettingsProps> &
  TranslationsProvides & { stack: StackState };

export const isStack = (data: unknown): data is StackType => {
  const result = S.validate(StackItem)(data);
  const program = Effect.match(result, {
    onFailure: () => false,
    onSuccess: () => true,
  });
  return Effect.runSync(program);
};
