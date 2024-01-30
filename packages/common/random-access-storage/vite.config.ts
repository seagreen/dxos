import { defineConfig } from 'vitest/config';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { FixGracefulFsPlugin } from '@dxos/esbuild-plugins';
import { dirname, resolve } from 'path';
import { stat } from 'fs/promises';
import type { ESBuildOptions, Plugin } from 'vite';

const isDebug = !!process.env.VITEST_DEBUG;

function createNodeConfig() {
  return defineConfig({
    test: {
      reporters: ['basic'],
      environment: 'node',
      include: ['**/*.test.ts'],
    },
  });
}

function createBrowserConfig() {
  return defineConfig({
    plugins: [
      pluginAlias({
        alias: {
          'src/index.ts': 'src/browser/index.ts',
        },
      }),
      rollupPluginNodeStd(),
      // nodePolyfills(),
    ],
    resolve: {
      alias: {
        // buffer: '@dxos/node-std/buffer',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [FixGracefulFsPlugin(), esbuildPluginNodeStd()],
      },
    },
    test: {
      reporters: ['basic'],
      include: ['**/*.test.ts'],

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
  const resolvePath = (path) => {
    if (path.startsWith('.')) {
      return resolve(path);
    } else {
      return path;
    }
  };

  const resolvedAliases = {};
  for (const [key, value] of Object.entries(alias)) {
    resolvedAliases[resolvePath(key)] = resolvePath(value);
  }

  return {
    name: 'alias',
    resolveId: {
      order: 'pre',
      handler: async (source, importer, options) => {
        if (!importer) return null;

        if (!source.startsWith('.')) {
          if (!!resolvedAliases[source]) {
            return resolvedAliases[source];
          } else {
            return null;
          }
        }

        try {
          let path = resolve(dirname(importer), source);

          if ((await stat(path)).isDirectory()) {
            path = resolve(path, 'index.ts');
          }

          if (!!resolvedAliases[path]) {
            return resolvedAliases[path];
          }
        } catch (err) {}
        return null;
      },
    },
  };
}

const NODE_MODULES = [
  'assert',
  'crypto',
  'events',
  'globals',
  'inject-globals',
  'path',
  'stream',
  'util',
  'fs',
  'fs/promises',
  'buffer',
  'os',
];

function rollupPluginNodeStd(): Plugin {
  return {
    name: 'node-std',

    config(config) {
      console.log(config.optimizeDeps?.esbuildOptions);

      config.esbuild ||= {};

      // (config.esbuild as any)!.inject = ['@inject-globals'];
      (config.esbuild as any)!.banner ||= {};
      (config.esbuild as any)!.banner = 'import "@dxos/node-std/globals";';

      (((config.optimizeDeps ??= {}).esbuildOptions ??= {}).banner ||= {}).js = 'import "@dxos/node-std/globals";';
      return config;
    },

    resolveId: {
      order: 'pre',
      async handler(source, importer, options) {
        if (source.startsWith('node:')) {
          return this.resolve(`@dxos/node-std/${source.slice('node:'.length)}`);
        }
        if (NODE_MODULES.includes(source)) {
          return this.resolve(`@dxos/node-std/${source}`);
        }

        return null;
      },
    },
  };
}

const GLOBALS = ['global', 'Buffer', 'process'];

function esbuildPluginNodeStd() {
  return {
    name: 'node-external',
    setup: ({ initialOptions, onResolve, onLoad }) => {
      initialOptions.inject = ['@inject-globals'];
      initialOptions.banner ||= {};
      initialOptions.banner.js = 'import "@dxos/node-std/globals";';

      onResolve({ filter: /^@inject-globals*/ }, (args) => {
        return { path: '@inject-globals', namespace: 'inject-globals' };
      });

      onLoad({ filter: /^@inject-globals/, namespace: 'inject-globals' }, async (args) => {
        return {
          contents: `
            export {
              ${GLOBALS.join(',\n')}
            } from '@dxos/node-std/inject-globals';
            // Empty source map so that esbuild does not inject virtual source file names.
            //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==
          `,
        };
      });

      onResolve({ filter: /^@dxos\/node-std\/inject-globals$/ }, (args) => {
        return { external: true, path: '@dxos/node-std/inject-globals' };
      });

      onResolve({ filter: /^node:.*/ }, (args) => {
        const module = args.path.replace(/^node:/, '');
        return { external: true, path: `@dxos/node-std/${module}` };
      });

      for (const module of NODE_MODULES) {
        onResolve({ filter: new RegExp(`^${module}$`) }, (args) => {
          return { external: true, path: `@dxos/node-std/${module}` };
        });
      }
    },
  };
}
