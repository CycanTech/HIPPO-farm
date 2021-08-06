import { LOCALES, getCurrentLang } from '../i18n/utils'

import Home from '../pages/home/home.vue'
type importResult = Promise<typeof import('*.vue')>
const Index = (): importResult => import('../pages/index/index.vue')
const Stake = (): importResult => import('../pages/stake/stake.vue')
const Unstake = (): importResult => import('../pages/unstake/unstake.vue')
const Historys = (): importResult => import('../pages/historys/historys.vue')

const routes = [
  {
    path: '',
    component: Index,
  },
  {
    path: 'stake',
    component: Stake,
  },
  {
    path: 'unstake',
    component: Unstake,
  },
  {
    path: 'historys',
    component: Historys,
  },
]

export default [
  {
    path: '/',
    redirect: function (): string {
      const defaultLang = getCurrentLang()
      return `/${defaultLang}`
    },
  },
  { path: `/${LOCALES.ZH}`, component: Home, children: routes },
  { path: `/${LOCALES.EN}`, component: Home, children: routes },
]
