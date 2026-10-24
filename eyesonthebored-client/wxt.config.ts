import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztm2U9g1okGtrJAbJk0iCck/BtcfzRU7010Qolfk2CMlpjf+IYKY5YCxNZgyPDa9zCwcNIk5vnFyOYFpYZ4GUoXhNXGI1IswFyYoTWicfRQAIJEKwNRuHxst+qiZfXtIoqpdCwzue1tdE8cgrW8OXwI4xf0h1UYKvmwvTAOVi8Jz3TFJ8ofZmteCXQGYIQ4H5ygyDPUqM2ivdx/7WseOwNdgZVnNCsuMRuIwCkh5tAfMMKPNiehd6iGlSPPQk91OxESfo+UCVc6iV2IceCs8iMDclzcSU6RMC+R0jjPx9YCIx/pYx78iD6Qpve3R9606bdHff5xFecGrazX6OWHyyQIDAQAB',
    description: "A simple attention monitoring extension.",
    permissions: ['storage', 'alarms', 'tabs', "idle","notifications"],
  },
});
