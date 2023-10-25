// This globally imports and registers markdownit
// See: https://github.com/nuxt-community/markdownit-module/issues/47#issuecomment-1453684664

import md from 'markdown-it'
import { render } from 'nuxt/dist/app/compat/capi'

export default defineNuxtPlugin(nuxtApp => {

  const renderer = md()

  return {
    provide: { md: renderer }
  }
})