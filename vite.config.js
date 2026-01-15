import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vuetify from "vite-plugin-vuetify"

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  base: process.env.DEPLOY_ENV === "GH_PAGES" ? "/tuto-dessin/" : "/",

})
