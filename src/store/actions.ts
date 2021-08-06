import { ActionContext } from 'vuex'
import { PoolInfo, State, UserInfo } from './state-types'
import i18n from '../i18n/index'
import types from './mutation-types'
import getProvider from '../common/ts/getProvider'
import { Toast } from '../components/toast/index'
import { Dialog } from '../components/dialog/index'
import { CHAIN_ID_LIST } from '../common/ts/const'
import deepCopy from 'lodash.clonedeep'
import getPoos, { getPoolInfo, updatePools, updatePool } from '../data/getPoos'
import getAPYS from '@/data/getAPYS'
import TransactionHistory from '@/common/ts/TransactionHistory'

export default {
  async handleConnect({ commit }: ActionContext<State, State>): Promise<void> {
    const provider = getProvider()
    if (provider === undefined) {
      Toast.info('Failed to find wallet.')
      return
    }
    if (
      !CHAIN_ID_LIST.includes(
        provider.networkVersion
          ? provider.networkVersion
          : provider.chainId
          ? provider.chainId.toString()
          : undefined
      )
    ) {
      Dialog({
        title: 'tip',
        content: i18n.global.t('netSupportChain'),
        confirmText: i18n.global.t('confirm'),
        confirm: true,
      })
      return
    }
    try {
      const [address] = await provider.enable()
      commit(types.SET_USER_INFO, { account: address } as UserInfo)
    } catch (error) {
      Toast.info('Failed to connect to wallet.')
      console.log(`Enable account error ${error}`)
    }
  },
  handleDisconnect({ commit }: ActionContext<State, State>): void {
    commit(types.SET_USER_INFO, {})
  },
  async handleAccountChange(
    { commit }: ActionContext<State, State>,
    account: string
  ): Promise<void> {
    commit(types.SET_USER_INFO, { account })
  },
  async getPools({ commit, dispatch }: ActionContext<State, State>): Promise<void> {
    commit(types.SET_LOADING_POOLS, true)
    commit(types.SET_POOLS, [])
    commit(types.SET_POOLS, await getPoos())
    commit(types.SET_LOADING_POOLS, false)
    dispatch('getAPYS')
  },
  async getAPYS({ commit, state }: ActionContext<State, State>): Promise<void> {
    commit(types.SET_APYS, await getAPYS(state.pools))
  },
  async updatePools({ commit, state }: ActionContext<State, State>): Promise<void> {
    const pools = deepCopy(state.pools)
    const updatedPools = await updatePools(pools, state.userInfo.account)
    commit(types.SET_POOLS, updatedPools)
  },
  setCurrentPool({ commit }: ActionContext<State, State>, pool: PoolInfo): void {
    commit(types.SET_CURRENT_POOL, pool)
  },
  changeShowWalletModel({ commit }: ActionContext<State, State>, showWalletModel: boolean): void {
    commit(types.SET_SHOW_WALLET_MODEL, showWalletModel)
  },
  addHistorys(
    { commit, state }: ActionContext<State, State>,
    historys: TransactionHistory[]
  ): void {
    commit(types.SET_HISTORYS, [...historys, ...state.historys])
  },
  async updatePool({ commit, state }: ActionContext<State, State>, poolId: number): Promise<void> {
    const pool = await getPoolInfo(poolId)
    const pools = deepCopy(state.pools)
    const index = pools.findIndex((item) => item.poolId === poolId)
    if (pool === undefined || !state.userInfo.account || index === -1) {
      return
    }
    const updatedPool = await updatePool(pool, state.userInfo.account)
    pools[index] = updatedPool
    if (state.currentPool?.poolId === poolId) {
      commit(types.SET_CURRENT_POOL, updatedPool)
    }
    commit(types.SET_POOLS, pools)
  },
}
