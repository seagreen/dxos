//
// Copyright 2023 DXOS.org
//

import { defineConfig } from 'vite';
import ReactPlugin from '@vitejs/plugin-react';
import { resolve } from 'path';
import { ThemePlugin } from "@dxos/react-ui-theme/plugin";

import { ConfigPlugin } from "@dxos/config/vite-plugin";

const { osThemeExtension } = require('@dxos/react-shell/theme-extensions');

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: 'out/matrix',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index.html')
      },
      output: {
        // chunkFileNames,
        manualChunks: {
          react: ['react', 'react-dom'],
          dxos: ['@dxos/react-client'],
          ui: ['@dxos/react-ui', '@dxos/react-ui-theme'],
          editor: ['@dxos/react-ui-editor'],
        },
      },
    },
  },
  plugins: [
    ConfigPlugin(),
    ThemePlugin({
      extensions: [osThemeExtension],
      root: __dirname,
      content: [
        resolve(__dirname, './index.html'),
        resolve(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
      ],
    }),
    ReactPlugin({ jsxRuntime: 'classic' }),
  ],
  server: {
    host: true,
  },
});
