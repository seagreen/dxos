//
// Copyright 2023 DXOS.org
//

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import ReactPlugin from '@vitejs/plugin-react';
import { resolve } from "path";
import { ThemePlugin } from "@dxos/react-ui-theme/plugin";

import { ConfigPlugin } from "@dxos/config/vite-plugin";

const { osThemeExtension } = require('@dxos/react-shell/theme-extensions');

// TODO(burdon): Remove unnecessary deps.

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
        chunkFileNames,
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
    {
      name: 'bundle-buddy',
      buildEnd() {
        const deps: { source: string; target: string }[] = [];
        for (const id of this.getModuleIds()) {
          const m = this.getModuleInfo(id);
          if (m != null && !m.isExternal) {
            for (const target of m.importedIds) {
              deps.push({ source: m.id, target });
            }
          }
        }

        const outDir = join(__dirname, 'out');
        if (!existsSync(outDir)) {
          mkdirSync(outDir);
        }
        writeFileSync(join(outDir, 'graph.json'), JSON.stringify(deps, null, 2));
      },
    },
  ],
  server: {
    host: true,
    fs: {
      strict: false,
      allow: [
        // TODO(wittjosiah): Not detecting pnpm-workspace?
        //   https://vitejs.dev/config/server-options.html#server-fs-allow
        searchForWorkspaceRoot(process.cwd()),
      ],
    },
  },
});

function chunkFileNames (chunkInfo) {
  if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.match(/index.[^\/]+$/gm)) {
    let segments = chunkInfo.facadeModuleId.split('/').reverse().slice(1);
    const nodeModulesIdx = segments.indexOf('node_modules');
    if (nodeModulesIdx !== -1) {
      segments = segments.slice(0, nodeModulesIdx);
    }
    const ignoredNames = [
      'dist',
      'lib',
      'browser'
    ]
    const significantSegment = segments.find(segment => !ignoredNames.includes(segment));
    if (significantSegment) {
      return `assets/${significantSegment}-[hash].js`;
    }
  }

  return 'assets/[name]-[hash].js';
}
