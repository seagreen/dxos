import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { FixGracefulFsPlugin } from '@dxos/esbuild-plugins';
import { dirname, resolve } from 'path';
import { stat } from 'fs/promises';
import type { Plugin } from 'vite'

const isDebug = !!process.env.VITEST_DEBUG;

function createNodeConfig() {
  return defineConfig({
    test: {
      reporters: ['basic'],
      environment: 'node',
      include: ['*/node/**.test.ts'],
    },
  });
}

function createBrowserConfig() {
  return defineConfig({
    plugins: [
      pluginAlias({
        alias: {
          'src/index.ts': 'src/browser/index.ts',
        }
      }),
      nodePolyfills(),
    ],
    resolve: {
      alias: {
        buffer: 'buffer/',
      },
    },
    optimizeDeps: {
      include: ['buffer/'],
      esbuildOptions: {
        plugins: [FixGracefulFsPlugin()],
      },
    },
    test: {
      reporters: ['basic'],
      include: ['*/browser/**.test.ts'],

      testTimeout: isDebug ? 99999999 : undefined,

      onStackTrace(error, stack) {
        return true;
      },

      isolate: false,
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
      browser: {
        enabled: true,
        headless: !isDebug,
        name: 'chrome',
        isolate: false,
      },
    },
  });
}

function resolveConfig() {
  switch (process.env.VITEST_ENV?.toLowerCase()) {
    case 'browser':
      return createBrowserConfig();
    case 'node':
    default:
      return createNodeConfig();
  }
}

export default resolveConfig();


function pluginAlias({ alias }: { alias: Record<string, string> }): Plugin {
  const resolvedAliases = {} 
  for(const [key, value] of Object.entries(alias)) {
    resolvedAliases[resolve(key)] = resolve(value);
  }

  console.log({ resolvedAliases })

  return {
    name: 'alias',
    resolveId: {
      order: 'pre',
      handler: async (source, importer, options) => {
        if (!importer) return null;
        
        try {
          let path = resolve(dirname(importer), source);

          if((await stat(path)).isDirectory()) {
            path = resolve(path, 'index.ts');
          }

          if(!!resolvedAliases[path]) {
            return resolvedAliases[path];
          }
        } catch (err) {
        }
        return null;
      },
    },
  }
}