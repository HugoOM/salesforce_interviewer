import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/dev/",
  server: {
    port: 3000,
    host: true,
    hmr: {
      port: 443, //WTF? Internal 443 because of wss? Port's not even exposed ...
    },
  },
});
