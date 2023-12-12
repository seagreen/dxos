//
// Copyright 2023 DXOS.org
//

// This includes css styles from @dxos/react-ui-theme.
// This must precede all other style imports in the app.
import '@dxosTheme';

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '@dxos/react-ui';
import { defaultTx } from '@dxos/react-ui-theme';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider tx={defaultTx}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
