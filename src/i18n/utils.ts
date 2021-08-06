import { getItem, setItem } from '../common/ts/utils'

export const LANGUAGE_KEY = 'LANGUAGE_KEY'

export enum LOCALES {
  EN = 'en-US',
  ZH = 'zh-CN',
}

// eslint-disable-next-line
export const isLocale = (val: any): val is LOCALES => {
  return [LOCALES.EN, LOCALES.ZH].includes(val)
}

export function getCurrentLang(): LOCALES {
  const hash = window.location.hash
  const hashZhLang =
    hash.indexOf('/zh-') >= 0 ? LOCALES.ZH : hash.indexOf('/en-') >= 0 ? LOCALES.EN : ''
  const lang = hashZhLang || getItem(LANGUAGE_KEY) || window.navigator.language || LOCALES.EN
  let defaultLang = LOCALES.EN
  if (lang.indexOf('zh-') >= 0) {
    defaultLang = LOCALES.ZH
  }
  setItem(LANGUAGE_KEY, defaultLang)
  return defaultLang
}
