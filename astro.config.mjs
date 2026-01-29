// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import icon from 'astro-icon';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [
      tailwindcss(),
      {
        name: '@astrojs/ts-plugin',
      },
    ],
  },

  integrations: [react(), icon()],
  adapter: vercel(),
});