import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import IconsResolver from 'unplugin-icons/resolver';

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist',
      entryRoot: 'src',
      include: ['src/**/*'],
      rollupTypes: false,
      insertTypesEntry: true,
    }),
    vue(),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
    Components({
      dts: false,
      resolvers: [IconsResolver({ prefix: false, alias: { icon: 'heroicons' } })],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'CraftilePluginCommonProperties',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },

  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});
