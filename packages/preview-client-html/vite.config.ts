import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isCdnBuild = mode === 'cdn';

  return {
    plugins: [
      !isCdnBuild &&
        dts({
          outDir: 'dist',
          entryRoot: 'src',
          include: ['src/**/*'],
          rollupTypes: false,
          insertTypesEntry: true,
        }),
    ].filter(Boolean),

    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'HtmlPreviewClient',
        formats: [isCdnBuild ? 'iife' : 'es'],
        fileName: () => (isCdnBuild ? 'html.cdn.js' : 'index.js'),
      },
      rollupOptions: {
        external: isCdnBuild ? [] : ['@craftile/preview-client', 'morphdom'],
        output: {
          inlineDynamicImports: isCdnBuild,
        },
      },

      target: 'es2020',
      minify: isCdnBuild,
      emptyOutDir: false,
    },
  };
});
