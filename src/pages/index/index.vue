<template>
  <div class="index">
    <div class="bar">
      <div class="staked" @click="isOnlyStaked = !isOnlyStaked">
        {{ t('staked') }}
        <div class="checkbox" :class="{ checked: isOnlyStaked }" />
      </div>
      <div class="contract" @click="jump(`https://bscscan.com/address/${MASTER_CHEF_ADDRESS}`)">
        <span>{{ t('viewContract') }}</span>
        <img src="./contract.png" />
      </div>
      <div class="history" @click="toHistory">
        <span>{{ t('history') }}</span>
        <img src="./history.png" />
      </div>
    </div>
    <div class="pools">
      <div class="pool" v-for="(pool, index) in pools" :key="index">
        <div class="head">
          <div class="logos" v-if="pool.currencys">
            <token-avatar :token="pool.currencys[1]" :height="40" :width="40" />
            <token-avatar :token="pool.currencys[0]" :height="40" :width="40" />
          </div>
          <div class="symbol">{{ pool.tokenSymbol }}</div>
          <button class="stake" @click="toStake(pool)">{{ t('stakeLP') }}</button>
        </div>
        <div class="amounts">
          <div class="earned">
            <div class="label">
              <span>{{ t('earned') }}</span>
              <div class="logos" v-if="pool.earningsAmount">
                <token-avatar :token="pool.earningsAmount.token" :height="16" :width="16" />
              </div>
            </div>
            <div class="amount">{{ pool.earningsAmount?.toSignificant(8) ?? '-' }}</div>
            <div class="label">{{ t('balance') }}</div>
            <div class="amount">
              {{ pool.earningsBalanceAmount?.toSignificant(8) ?? '-' }}
            </div>
            <button @click="onHarvestEarned(pool)" :disabled="harvestDisable(pool)">
              {{ t('harvest') }}
            </button>
          </div>
          <div class="staked">
            <div class="label">
              <span> {{ t('staked') }}</span>
              <div class="logos" v-if="pool.currencys">
                <token-avatar :token="pool.currencys[1]" :height="16" :width="16" />
                <token-avatar :token="pool.currencys[0]" :height="16" :width="16" />
              </div>
            </div>
            <div class="amount">
              <span> {{ pool.stakedAmount?.toSignificant(8) ?? '-' }}</span>
            </div>
            <div class="label">{{ t('balance') }}</div>
            <div class="amount">
              {{ pool.stakeTokenBalanceAmount?.toSignificant(8) ?? '-' }}
            </div>
            <button @click="toUnstake(pool)">{{ t('unstake') }}</button>
          </div>
        </div>
        <div class="pool-info">
          <div class="pool-share">
            <span>{{ t('poolShare') }}:</span>
            <span>{{ poolShare(pool) }}</span>
          </div>
          <div class="APY">
            <span>{{ t('APY') }}:</span>
            <span>{{ APYS[pool.poolId] ?? '-' }}%</span>
            <img @click="learnAPY" src="./doubt.png" />
          </div>
        </div>
      </div>
      <div class="loading" v-if="isLoadingPools">
        <loading />
        <span>Loading...</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import useProxyRouter from '../../common/use/useProxyRouter'
import { PoolInfo, State } from '../../store/state-types'
import TokenAvatar from '../../components/token-avatar/token-avatar.vue'
import Loading from '../../components/loading/index.vue'
import { MASTER_CHEF_ADDRESS, MINING_TOKEN, ZERO, ONE_BIPS } from '@/common/ts/const'
import { Percent, TokenAmount } from '@cointribute/pancakeswap-sdk-v2'
import { Dialog } from '@/components/dialog'
import { Toast } from '@/components/toast'
import getWeb3 from '@/common/ts/getWeb3'
import MasterChefAbi from '../../abi/MasterChefAbi.json'
import { getContract } from '@/common/ts/utils'
import jump from '../../common/ts/jump'
import TransactionHistory, {
  TRANSACTION_SYMBOLS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@/common/ts/TransactionHistory'

export default defineComponent({
  components: {
    TokenAvatar,
    Loading,
  },
  setup() {
    const store = useStore<State>()
    const { t } = useI18n()
    const router = useProxyRouter()

    const isOnlyStaked = ref(false)

    const pools = computed(() => {
      if (!isConnected.value || !isOnlyStaked.value) {
        return store.state.pools
      }
      return store.state.pools.filter((item) => item.stakedAmount?.greaterThan(ZERO))
    })
    const APYS = computed(() => store.state.APYS)
    const isConnected = computed<boolean>(() => store.getters.isConnected)
    const account = computed(() => store.state.userInfo?.account)
    const isLoadingPools = computed(() => store.state.isLoadingPools)
    const harvestDisable = computed(() => (pool: PoolInfo) => {
      if (!isConnected.value || !pool.earningsBalanceAmount) {
        return true
      }
      return pool.earningsAmount?.equalTo(ZERO) ? true : false
    })
    const toStake = (pool: PoolInfo) => {
      store.dispatch('setCurrentPool', pool)
      router.push({ path: '/stake', query: { poolId: pool.poolId } })
    }
    const toUnstake = (pool: PoolInfo) => {
      store.dispatch('setCurrentPool', pool)
      router.push({ path: '/unstake', query: { poolId: pool.poolId } })
    }
    const toHistory = () => {
      router.push({ path: '/historys' })
    }
    const onHarvestEarned = async (pool: PoolInfo) => {
      const web3 = getWeb3()
      if (!web3 || !account.value || !pool || !pool.earningsAmount) {
        return
      }
      Toast.loading('loading...')
      const contract = getContract(MasterChefAbi, MASTER_CHEF_ADDRESS, web3)
      try {
        const withdraw = contract.methods.withdraw(pool.poolId, 0)
        await withdraw.send({ from: account.value })
        Toast.clear()
        Toast.success(t('harvestEarnedSuccess'))
        _addHistory(pool.earningsAmount, TRANSACTION_STATUS.SUCCESS)
        store.dispatch('updatePool', pool.poolId)
      } catch (error) {
        Toast.clear()
        if (error?.code !== 4001) {
          Toast.info(t('harvestEarnedFailed'))
          _addHistory(pool.earningsAmount, TRANSACTION_STATUS.FAILED)
          console.log(error)
        }
      }
    }
    const _addHistory = (amount: TokenAmount, status: TRANSACTION_STATUS) => {
      store.dispatch('addHistorys', [
        new TransactionHistory(
          amount,
          status,
          TRANSACTION_SYMBOLS.PLUS,
          amount.token.symbol as string,
          TRANSACTION_TYPE.HARVEST_EARNED
        ),
      ])
    }
    const learnAPY = () => {
      Dialog({
        title: t('APY'),
        content: t('APRDesc'),
        confirmText: t('confirm'),
      })
    }
    const poolShare = (pool: PoolInfo) => {
      if (!isConnected.value) {
        return '-'
      }
      if (!pool.stakedAmount || pool.stakedAmount.equalTo(ZERO)) {
        return '0%'
      }
      if (pool.poolStakedTokenAmount.lessThan(pool.stakedAmount)) {
        return '<0.01%'
      }
      const percentage = new Percent(pool.stakedAmount.raw, pool.poolStakedTokenAmount.raw)
      return percentage.lessThan(ONE_BIPS) ? '<0.01%' : `≈${percentage.toFixed(2)}%`
    }

    return {
      pools,
      isLoadingPools,
      isConnected,
      isOnlyStaked,
      APYS,
      MINING_TOKEN,
      harvestDisable,
      MASTER_CHEF_ADDRESS,

      toStake,
      toUnstake,
      toHistory,
      onHarvestEarned,
      t,
      jump,
      poolShare,
      learnAPY,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/mixin';
@import '../../scss/variable';
.index {
  max-width: 420px;
  margin: 60px auto;
  .bar {
    display: flex;
    height: 56px;
    padding: 0 20px;
    background: #29294b;
    border-radius: 6px 6px 0 0;
    .staked {
      display: flex;
      align-items: center;
      flex: 1.2;
      font-size: $font-size-large;
      font-weight: 500;
      cursor: pointer;
      span {
        line-height: 16px;
      }
      .checkbox {
        width: 16px;
        height: 16px;
        border: 1px solid #4c4f80;
        box-sizing: border-box;
        border-radius: 50%;
        margin-left: 10px;
        &.checked {
          background: url('./checked.png') no-repeat;
          background-size: 16px 16px;
          border: 0;
        }
      }
    }
    .contract,
    .history {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      cursor: pointer;
      flex: 1;
      font-size: $font-size-small;
      img {
        margin-left: 10px;
      }
    }
    .contract {
      img {
        width: 13px;
        height: 16px;
      }
    }
    .history {
      img {
        width: 16px;
        height: 16px;
      }
    }
  }
  .pools {
    .pool {
      .head {
        display: flex;
        align-items: center;
        position: relative;
        height: 70px;
        padding: 0 20px;
        background: #3d3f68;
        border-radius: 6px;
        .logos {
          display: flex;
          align-items: center;
          img:first-child {
            border-radius: 2px solid #3d3f68;
            transform: translateX(5px);
          }
        }
        .symbol {
          margin-left: 15px;
          font-weight: $font-size-large;
        }
        .stake {
          position: absolute;
          right: 20px;
          width: 99px;
          height: 40px;
          background: #d52282;
          border-radius: 6px;
          border: 0;
          outline: none;
          color: $color-text-white;
          cursor: pointer;
        }
      }
      .amounts {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        .earned,
        .staked {
          display: flex;
          flex-direction: column;
          padding: 20px;
          flex: 1;
          background: #29294b;
          border-radius: 6px;
          .label {
            display: flex;
            align-items: center;
            font-size: $font-size-small;
            margin-bottom: 10px;
            height: 16px;
            .logos {
              display: flex;
              align-items: center;
              margin-left: 5px;
              img:first-child {
                transform: translateX(2px);
              }
            }
          }
          .amount {
            background: #3d3f68;
            border-radius: 6px;
            font-weight: $font-size-large;
            padding: 10px 12px;
            line-height: 16px;
            margin-bottom: 20px;
          }
          button {
            height: 40px;
            border-radius: 6px;
            background: #d52282;
            outline: none;
            color: $color-text-white;
            cursor: pointer;
            border: 0;
            &:disabled {
              cursor: not-allowed;
              background: #222141;
              color: rgba($color: $color-text-white, $alpha: 0.4);
            }
          }
        }
        .earned {
          margin-right: 10px;
        }
        .staked {
          margin-left: 10px;
        }
      }
      .pool-info {
        display: flex;
        align-items: center;
        height: 50px;
        border-radius: 6px;
        border: 1px solid #3d3f68;
        margin-top: 20px;
        padding: 0 20px;
        font-size: $font-size-medium;
        .pool-share,
        .APY {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .APY {
          flex: 1;
          img {
            height: 16px;
            width: 16px;
            margin-left: 10px;
            cursor: pointer;
          }
        }
      }
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 100%;
      height: 200px;
      img {
        height: 50px;
        width: 50px;
      }
      span {
        margin-top: 10px;
      }
    }
  }
  @include mobile {
    margin: 20px;
    max-width: 100%;
    .bar {
      .staked {
        flex: 1;
      }
    }
    .pools {
      .pool {
        .head {
          .stake {
            width: 75px;
          }
        }
      }
    }
  }
}
</style>
