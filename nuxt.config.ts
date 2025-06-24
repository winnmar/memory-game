// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/image'],
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
  ],
  compatibilityDate: '2025-05-15',
})
