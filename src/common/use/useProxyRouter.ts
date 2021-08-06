import { useRouter, NavigationFailure, LocationAsPath, Router } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { WritableComputedRef } from 'vue'

const prefixPath = (to: string, locale: string): string => {
  return to.indexOf(locale) > -1 ? to : `/${locale}${to.indexOf('/') === 0 ? to : `/${to}`}`
}
const getConfig = (to: LocationAsPath | string, locale: WritableComputedRef<string>) => {
  const config = {
    path: typeof to === 'string' ? prefixPath(to, locale.value) : prefixPath(to.path, locale.value),
  }
  return typeof to === 'object' ? Object.assign({}, to, config) : config
}

export default function useProxyRouter(): Router {
  const { locale } = useI18n()
  const router = useRouter()

  const push = router.push
  const replace = router.replace

  router.push = (to: LocationAsPath | string): Promise<void | NavigationFailure | undefined> =>
    push(getConfig(to, locale))

  router.replace = (to: LocationAsPath | string): Promise<void | NavigationFailure | undefined> =>
    replace(getConfig(to, locale))

  return router
}
