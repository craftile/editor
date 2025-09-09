import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist',
      entryRoot: 'src',
      include: ['src/**/*'],
      rollupTypes: false,
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'CraftilePluginStaticBlocksRenderer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
  },
});
