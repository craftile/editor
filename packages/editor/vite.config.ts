import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import PrefixWrap from 'postcss-prefixwrap';

export default defineConfig({
  plugins: [
    dts({ include: ['src/**'], exclude: ['src/**/*.vue', 'src/components/**/*', 'src/composables/**/*'] }),
    vue(),
    tailwindcss(),

    cssInjectedByJsPlugin({
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(outputChunk) {
        return outputChunk.fileName.startsWith('index');
      },
    }),

    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables'],
      vueTemplate: true,
      viteOptimizeDeps: true,
    }),

    Components({
      dts: 'src/components.d.ts',
      directoryAsNamespace: true,
      resolvers: [IconsResolver({ prefix: false, alias: { icon: 'heroicons' } })],
    }),

    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
  ],

  css: {
    postcss: {
      plugins: [PrefixWrap('.__craftile')],
    },
  },

  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es'],
    },
  },
});
