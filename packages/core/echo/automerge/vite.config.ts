import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],

  build: {
    outDir: 'dist/lib/vite',
    lib: {
      formats: ['es'],
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/automerge-wasm.ts'),
      // the proper extensions will be added
      // fileName: 'automerge-wasm',
    },
    minify: false,
    rollupOptions: {
    },
  },
})
