import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Served from the main Vlue Rides site under /store/ (see admin_vluerides
  // react-admin/public/.htaccess), not from its own domain.
  base: '/store/',
  server: {
    port: 3000,
  },
});
