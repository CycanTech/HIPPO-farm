<template>
  <m-page class="stake-page" :title="title">
    <div class="slider-wrapper">
      <slider class="slider" v-model="percentToStake" :disabled="sliderDisable" />
      <span class="max" @click="onStakeMax">Max</span>
    </div>
    <div class="input-wrap">
      <numerical-input
        class="input"
        :placeholder="t('pleaseInputStakeAmount')"
        v-model="baseStakeAmount"
      />
    </div>
    <div class="balance">
      <span>{{ t('balance') }}</span>
      <div class="amount">
        <span>{{ stakeTokenBalance?.toSignificant(9) ?? '-' }}</span>
        <span class="symbol">{{ poolInfo?.tokenSymbol }}</span>
      </div>
    </div>
    <div class="pool-share">
      <span>{{ t('poolShare') }}</span>
      <span class="percent">{{ poolShare }}</span>
    </div>
    <div class="get" @click="onAddLiquid" v-if="poolInfo?.tokenSymbol">
      {{ t('get') }}{{ poolInfo?.tokenSymbol }}
    </div>
    <div class="buttons">
      <button v-if="!isConnected" @click="onConnect">
        {{ t('connect') }}
      </button>
      <button
        v-else-if="!isApproved"
        :disabled="isApproving || isApproved === undefined"
        @click="onApprove"
      >
        <loading v-if="isApproving || isApproved === undefined" />
        <span>{{ t(isApproving ? 'approving' : 'approve') }}</span>
      </button>
      <button v-else :disabled="stakeButtonDisable" @click="onConfirm">
        {{
          t(
            !stakeAmount
              ? 'pleaseInputStakeAmount'
              : isInsufficientBalance
              ? 'insufficientBalance'
              : 'stake'
          )
        }}
      </button>
    </div>
  </m-page>
  <m-dialog
    :show="showConfirmDialog"
    :title="t('confirmStakeDialogTitle')"
    :cancelText="t('cancel')"
    :confirmText="t('confirm')"
    :cancel="true"
    :confirm="true"
    @confirm:click="onStake"
    @update:show="updateDialogShow"
  >
    <div class="confirm-stake-dialog-content">
      <div class="cell">
        <div class="label">{{ t('confirmStakeDialogAmount') }}</div>
        <div class="value">{{ stakeAmount?.toSignificant(8) ?? '-' }}</div>
      </div>
      <div class="cell">
        <div class="label">{{ t('confirmStakeDialogToken') }}</div>
        <div class="value">{{ poolInfo?.tokenSymbol }}</div>
      </div>
      <div class="cell">
        <div class="label">{{ t('confirmStakeDialogAddress') }}</div>
        <div class="value">{{ shortenAddress(account ?? '') }}</div>
      </div>
    </div>
  </m-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import MPage from '../../components/m-page/m-page.vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { PoolInfo, State } from '../../store/state-types'
import { Percent, TokenAmount } from '@cointribute/pancakeswap-sdk-v2'
import NumericalInput from '../../components/numerical-input/numerical-input.vue'
import Slider from '../../components/slider/slider.vue'
import Loading from '../../components/loading/index.vue'
import MDialog from '../../components/dialog/dialog.vue'
import { tryParseAmount, getContract, isWrappedBNB, shortenAddress } from '../../common/ts/utils'
import getWeb3 from '../../common/ts/getWeb3'
import { MASTER_CHEF_ADDRESS, ONE_BIPS, ZERO, MAX_BIPS } from '../../common/ts/const'
import MasterChefAbi from '../../abi/MasterChefAbi.json'
import getApproved from '@/data/getApproved'
import { getPoolInfo } from '../../data/getPoos'
import approve from '@/common/ts/approve'
import { Toast } from '@/components/toast'
import getBalance from '@/data/getBalance'
import jump from '../../common/ts/jump'
import TransactionHistory, {
  TRANSACTION_STATUS,
  TRANSACTION_SYMBOLS,
  TRANSACTION_TYPE,
} from '@/common/ts/TransactionHistory'

export default defineComponent({
  components: {
    MPage,
    NumericalInput,
    Slider,
    Loading,
    MDialog,
  },
  setup() {
    const { t } = useI18n()
    const store = useStore<State>()
    const route = useRoute()

    const isApproved = ref()
    const isApproving = ref(false)
    const showConfirmDialog = ref(false)
    const stakeTokenBalance = ref<TokenAmount>()
    const poolStakedTokenAmount = ref<TokenAmount>()
    const baseStakeAmount = ref<string>()
    const account = computed(() => store.state.userInfo.account)
    const title = computed(() => {
      if (poolInfo.value == undefined) {
        return ''
      }
      return `${t('stake')} ${poolInfo.value.tokenSymbol}`
    })
    const poolInfo = computed(() => store.state.currentPool)
    const sliderDisable = computed(() => {
      return !isConnected.value || !stakeTokenBalance.value || stakeTokenBalance.value.equalTo(ZERO)
    })
    const isConnected = computed<boolean>(() => store.getters.isConnected)
    const isInsufficientBalance = computed(() => {
      if (!stakeAmount.value || !stakeTokenBalance.value) {
        return false
      }
      return stakeAmount.value.greaterThan(stakeTokenBalance.value)
    })
    const stakeButtonDisable = computed(() => {
      if (
        !stakeAmount.value ||
        !poolInfo.value ||
        !stakeTokenBalance.value ||
        isInsufficientBalance.value
      ) {
        return true
      }
      return false
    })
    const poolShare = computed(() => {
      if (!poolStakedTokenAmount.value || !stakeAmount.value || stakeAmount.value.equalTo(ZERO)) {
        return '-'
      }
      const percentage = new Percent(
        stakeAmount.value.raw,
        poolStakedTokenAmount.value.add(stakeAmount.value).raw
      )
      return percentage.lessThan(ONE_BIPS) ? '<0.01%' : `≈${percentage.toFixed(2)}%`
    })
    const stakeAmount = computed({
      get() {
        if (poolInfo.value === undefined) {
          return undefined
        }
        return tryParseAmount(baseStakeAmount.value, poolInfo.value.token)
      },
      set(v: TokenAmount | undefined) {
        baseStakeAmount.value = v?.toExact() ?? ''
      },
    })
    const percentToStake = computed({
      get() {
        if (
          !stakeAmount.value ||
          !stakeTokenBalance.value ||
          !isConnected.value ||
          stakeTokenBalance.value.equalTo(ZERO)
        ) {
          return undefined
        }
        const percent = new Percent(stakeAmount.value.raw, stakeTokenBalance.value.raw)
        if (percent.equalTo(MAX_BIPS) || percent.greaterThan(MAX_BIPS)) {
          return MAX_BIPS.toFixed(0)
        }
        return percent.toFixed(0)
      },
      set(v: string | undefined) {
        if (!isConnected.value || !stakeTokenBalance.value || !v) {
          return
        }
        const percent = new Percent(v, '100')
        stakeAmount.value = new TokenAmount(
          stakeTokenBalance.value.token,
          percent.multiply(stakeTokenBalance.value.raw).quotient
        )
      },
    })

    const _getPoolStakedTokenAmount = async (pool: PoolInfo) => {
      poolStakedTokenAmount.value = await getBalance(pool.token, MASTER_CHEF_ADDRESS)
    }
    const _getStakeTokenBalance = async (pool: PoolInfo, account: string) => {
      stakeTokenBalance.value = await getBalance(pool.token, account)
    }
    const _getApproved = async (pool: PoolInfo, account: string) => {
      isApproved.value = await getApproved(pool.token, MASTER_CHEF_ADDRESS, account)
    }
    const _getUserInfo = async (pool: PoolInfo, account: string) => {
      await Promise.all([_getApproved(pool, account), _getStakeTokenBalance(pool, account)])
    }

    const onApprove = async () => {
      if (!account.value || !poolInfo.value) {
        return
      }
      isApproving.value = true
      const hasApproved = await approve(poolInfo.value.token, MASTER_CHEF_ADDRESS, account.value)
      isApproving.value = false
      isApproved.value = hasApproved
      Toast[hasApproved ? 'success' : 'info'](t(hasApproved ? 'approveSuccess' : 'approveFailed'))
    }
    const onStake = async () => {
      const web3 = getWeb3()
      if (!web3 || !account.value || !poolInfo.value || !stakeAmount.value) {
        return
      }
      Toast.loading('loading...')
      const contract = getContract(MasterChefAbi, MASTER_CHEF_ADDRESS, web3)
      try {
        const deposit = contract.methods.deposit(
          poolInfo.value.poolId,
          stakeAmount.value.raw.toString()
        )
        await deposit.send({ from: account.value })
        Toast.clear()
        _handleStakeSuccess(stakeAmount.value, poolInfo.value, account.value)
      } catch (error) {
        Toast.clear()
        if (error?.code !== 4001) {
          Toast.info(t('stakeFailed'))
          _addHistory(stakeAmount.value, TRANSACTION_STATUS.FAILED, poolInfo.value.tokenSymbol)
          console.log(error)
        }
      }
    }
    const onStakeMax = () => {
      stakeAmount.value = stakeTokenBalance.value
    }
    const onConnect = () => {
      store.dispatch('changeShowWalletModel', true)
    }
    const updateDialogShow = (showDialog: boolean) => {
      showConfirmDialog.value = showDialog
    }
    const onConfirm = () => {
      showConfirmDialog.value = true
    }
    const onAddLiquid = () => {
      if (!poolInfo.value || !poolInfo.value.currencys) {
        return
      }
      const currencys = poolInfo.value.currencys

      return jump(
        `https://pancakeswap.finance/add/${
          isWrappedBNB(currencys[0]) ? 'BNB' : currencys[0].address
        }/${isWrappedBNB(currencys[1]) ? 'BNB' : currencys[1].address}`
      )
    }
    const _handleStakeSuccess = (amount: TokenAmount, pool: PoolInfo, account: string) => {
      Toast.success(t('stakeSuccess'))
      _addHistory(amount, TRANSACTION_STATUS.SUCCESS, pool.tokenSymbol)
      _getUserInfo(pool, account)
      store.dispatch('updatePool', pool.poolId)
      stakeAmount.value = undefined
    }
    const _addHistory = (amount: TokenAmount, status: TRANSACTION_STATUS, tokenSymbol: string) => {
      store.dispatch('addHistorys', [
        new TransactionHistory(
          amount,
          status,
          TRANSACTION_SYMBOLS.MINUS,
          tokenSymbol,
          TRANSACTION_TYPE.STAKE
        ),
      ])
    }

    onMounted(async () => {
      const { query } = route
      if (!poolInfo.value && query.poolId) {
        const pool = await getPoolInfo(Number(query.poolId))
        store.dispatch('setCurrentPool', pool)
      }
      if (poolInfo.value) {
        _getPoolStakedTokenAmount(poolInfo.value)
      }
      if (account.value && poolInfo.value) {
        _getUserInfo(poolInfo.value, account.value)
      }
    })
    watch([account], async () => {
      if (!account.value || !poolInfo.value) {
        return
      }
      _getUserInfo(poolInfo.value, account.value)
      store.dispatch('updatePool', poolInfo.value.poolId)
    })
    watch([isConnected], async ([isConnected]) => {
      if (!isConnected) {
        isApproved.value = undefined
        isApproving.value = false
        stakeTokenBalance.value = undefined
        poolStakedTokenAmount.value = undefined
        baseStakeAmount.value = undefined
      }
    })

    return {
      poolInfo,
      title,
      account,

      isConnected,
      isApproved,
      isApproving,
      stakeAmount,
      baseStakeAmount,
      percentToStake,
      sliderDisable,
      stakeButtonDisable,
      stakeTokenBalance,
      isInsufficientBalance,
      poolShare,
      showConfirmDialog,

      t,
      shortenAddress,
      updateDialogShow,
      onAddLiquid,
      onApprove,
      onStake,
      onStakeMax,
      onConnect,
      onConfirm,
    }
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
@import '../../scss/mixin';
.stake-page {
  .slider-wrapper {
    display: flex;
    padding: 30px 20px;
    .slider {
      flex: 1;
    }
    .max {
      flex: 0 0 60px;
      width: 60px;
      height: 26px;
      line-height: 26px;
      text-align: center;
      margin-left: 25px;
      background: #d52282;
      border-radius: 6px;
      cursor: pointer;
    }
  }
  .input-wrap {
    padding: 0 20px 5px 20px;
    input {
      height: 40px;
      background: #3d3f68;
      border-radius: 6px;
      text-align: center;
      color: #fff;
    }
  }
  .balance,
  .pool-share {
    display: flex;
    justify-content: space-between;
    padding: 15px 20px;
    color: #212140;
    font-size: 14px;
    font-weight: 500;
  }
  .balance {
    position: relative;
    .amount {
      .symbol {
        margin-left: 8px;
        font-weight: normal;
      }
    }
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 1px;
      background: #e4e4e4;
    }
  }
  .get {
    font-size: 14px;
    color: #d52282;
    font-weight: 500;
    padding: 0 20px;
    cursor: pointer;
  }
  .buttons {
    padding: 20px 20px 40px 20px;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 40px;
      background: #d52282;
      border-radius: 6px;
      color: #fff;
      outline: none;
      border: 0;
      cursor: pointer;
      img {
        height: 12px;
        width: 12px;
        margin: 0 3px 0 0;
      }
      &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
    }
  }
}
.confirm-stake-dialog-content {
  .cell {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    .label {
      color: #babfc4;
      font-weight: 600;
    }
  }
}
</style>
