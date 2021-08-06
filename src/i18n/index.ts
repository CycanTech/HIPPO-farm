import { createI18n } from 'vue-i18n'
import { getCurrentLang, LOCALES } from './utils'

import enLanguage from './languages/en.json'
import zhLanguage from './languages/zh.json'

export default createI18n({
  legacy: false,
  locale: getCurrentLang(),
  messages: {
    [LOCALES.EN]: enLanguage,
    [LOCALES.ZH]: zhLanguage,
  },
})
