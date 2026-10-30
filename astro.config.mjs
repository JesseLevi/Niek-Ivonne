// @ts-check
import { defineConfig } from 'astro/config';

// Volledig statische site. Deploy: Vercel of Netlify, output in dist/.
export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});
