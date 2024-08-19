import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  // // Add this if you want to use HTTPS
  // server: {
  //   https: true,
  // },
});
