// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'CS2 Memory Game',
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/image'],
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
  ],
  compatibilityDate: '2025-05-15',
})
