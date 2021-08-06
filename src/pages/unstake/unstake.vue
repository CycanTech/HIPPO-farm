<template>
  <m-page class="unstake-page" :title="title">
    <div class="slider-wrapper">
      <slider class="slider" v-model="percentToUnsake" :disabled="sliderDisable" />
      <span class="max" @click="onUnstakeMax">Max</span>
    </div>
    <div class="input-wrap">
      <numerical-input
        class="input"
        :placeholder="t('pleaseInputUnstakeAmount')"
        v-model="baseUnstakeAmount"
      />
    </div>
    <div class="balance">
      <span>{{ t('staked') }}</span>
      <div class="amount">
        <span>{{ stakedTokenAmount?.toSignificant(9) ?? '-' }}</span>
        <span class="symbol">{{ poolInfo?.tokenSymbol }}</span>
      </div>
    </div>
    <div class="buttons">
      <button v-if="!isConnected" @click="onConnect">
        {{ t('connect') }}
      </button>
      <button v-else :disabled="unstakeButtonDisable" @click="onConfirm">
        {{
          t(
            !unstakeAmount
              ? 'pleaseInputUnstakeAmount'
              : isUnstakeGreaterThanStakedAmount
              ? 'unstakeAmountCannotGreaterThanStakedAmount'
              : 'unstake'
          )
        }}
      </button>
    </div>
  </m-page>
  <m-dialog
    :show="showConfirmDialog"
    :title="t('confirmUnstakeDialogTitle')"
    :cancelText="t('cancel')"
    :confirmText="t('confirm')"
    :cancel="true"
    :confirm="true"
    @confirm:click="onUnstake"
    @update:show="updateDialogShow"
  >
    <div class="confirm-stake-dialog-content">
      <div class="cell">
        <div class="label">{{ t('confirmUnstakeDialogAmount') }}</div>
        <div class="value">{{ unstakeAmount?.toSignificant(8) ?? '-' }}</div>
      </div>
      <div class="cell">
        <div class="label">{{ t('confirmUnstakeDialogToken') }}</div>
        <div class="value">{{ poolInfo?.tokenSymbol }}</div>
      </div>
      <div class="cell">
        <div class="label">{{ t('confirmUnstakeDialogAddress') }}</div>
        <div class="value">{{ shortenAddress(account ?? '') }}</div>
      </div>
      <div class="tips">
        {{ t('confirmUnstakeDialogTips') }}
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
import MDialog from '../../components/dialog/dialog.vue'
import { tryParseAmount, getContract, shortenAddress } from '../../common/ts/utils'
import getWeb3 from '../../common/ts/getWeb3'
import { MASTER_CHEF_ADDRESS, MINING_TOKEN, ZERO, MAX_BIPS } from '../../common/ts/const'
import MasterChefAbi from '../../abi/MasterChefAbi.json'
import { getPoolInfo } from '../../data/getPoos'
import { Toast } from '@/components/toast'
import getNotAccountWeb3 from '@/common/ts/getNotAccountWeb3'
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
    MDialog,
  },
  setup() {
    const { t } = useI18n()
    const store = useStore<State>()
    const route = useRoute()

    const showConfirmDialog = ref(false)
    const stakedTokenAmount = ref<TokenAmount>()
    const baseUnstakeAmount = ref<string>()
    const account = computed(() => store.state.userInfo.account)
    const title = computed(() => {
      if (poolInfo.value == undefined) {
        return ''
      }
      return `${t('unstake')} ${poolInfo.value.tokenSymbol}`
    })
    const poolInfo = computed(() => store.state.currentPool)
    const isConnected = computed<boolean>(() => store.getters.isConnected)
    const sliderDisable = computed(() => {
      return !isConnected.value || !stakedTokenAmount.value || stakedTokenAmount.value.equalTo(ZERO)
    })
    const isUnstakeGreaterThanStakedAmount = computed(() => {
      if (!unstakeAmount.value || !stakedTokenAmount.value) {
        return false
      }
      return unstakeAmount.value.greaterThan(stakedTokenAmount.value)
    })
    const unstakeButtonDisable = computed(() => {
      if (
        !unstakeAmount.value ||
        !poolInfo.value ||
        !stakedTokenAmount.value ||
        isUnstakeGreaterThanStakedAmount.value
      ) {
        return true
      }
      return false
    })
    const unstakeAmount = computed({
      get() {
        if (poolInfo.value === undefined) {
          return undefined
        }
        return tryParseAmount(baseUnstakeAmount.value, poolInfo.value.token)
      },
      set(v: TokenAmount | undefined) {
        baseUnstakeAmount.value = v?.toExact() ?? ''
      },
    })
    const percentToUnsake = computed({
      get() {
        if (
          !unstakeAmount.value ||
          !stakedTokenAmount.value ||
          !isConnected.value ||
          stakedTokenAmount.value.equalTo(ZERO)
        ) {
          return undefined
        }
        const percent = new Percent(unstakeAmount.value.raw, stakedTokenAmount.value.raw)
        if (percent.equalTo(MAX_BIPS) || percent.greaterThan(MAX_BIPS)) {
          return MAX_BIPS.toFixed(0)
        }
        return percent.toFixed(0)
      },
      set(v: string | undefined) {
        if (!isConnected.value || !stakedTokenAmount.value || !v) {
          return
        }
        const percent = new Percent(v, '100')
        unstakeAmount.value = new TokenAmount(
          stakedTokenAmount.value.token,
          percent.multiply(stakedTokenAmount.value.raw).quotient
        )
      },
    })

    const _getStakedTokenAmount = async (pool: PoolInfo, account: string) => {
      const web3 = getNotAccountWeb3()
      const contract = getContract(MasterChefAbi, MASTER_CHEF_ADDRESS, web3)
      const userInfo = (await contract.methods.userInfo(pool.poolId, account).call()) as {
        amount: string
      }
      stakedTokenAmount.value = new TokenAmount(pool.token, userInfo.amount)
    }
    const _getUserInfo = async (pool: PoolInfo, account: string) => {
      await Promise.all([_getStakedTokenAmount(pool, account)])
    }
    const onUnstake = async () => {
      const web3 = getWeb3()
      if (!web3 || !account.value || !poolInfo.value || !unstakeAmount.value) {
        return
      }
      Toast.loading('loading...')
      const contract = getContract(MasterChefAbi, MASTER_CHEF_ADDRESS, web3)
      try {
        const withdraw = contract.methods.withdraw(
          poolInfo.value.poolId,
          unstakeAmount.value.raw.toString()
        )
        await withdraw.send({ from: account.value })
        Toast.clear()
        _addHarvestEarnedHistory()
        _handleUnstakeSuccess(unstakeAmount.value, poolInfo.value, account.value)
      } catch (error) {
        Toast.clear()
        if (error?.code !== 4001) {
          console.log(error)
          Toast.info(t('unstakeFailed'))
          _addUnstakeHistory(
            unstakeAmount.value,
            TRANSACTION_STATUS.FAILED,
            poolInfo.value.tokenSymbol
          )
        }
      }
    }
    const onUnstakeMax = () => {
      unstakeAmount.value = stakedTokenAmount.value
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
    const _addHarvestEarnedHistory = () => {
      if (!poolInfo.value || !poolInfo.value.earningsAmount) {
        return
      }
      store.dispatch('addHistorys', [
        new TransactionHistory(
          poolInfo.value.earningsAmount,
          TRANSACTION_STATUS.SUCCESS,
          TRANSACTION_SYMBOLS.PLUS,
          MINING_TOKEN.symbol as string,
          TRANSACTION_TYPE.UNSTAKE
        ),
      ])
    }
    const _addUnstakeHistory = (
      amount: TokenAmount,
      status: TRANSACTION_STATUS,
      tokenSymbol: string
    ) => {
      store.dispatch('addHistorys', [
        new TransactionHistory(
          amount,
          status,
          TRANSACTION_SYMBOLS.PLUS,
          tokenSymbol,
          TRANSACTION_TYPE.UNSTAKE
        ),
      ])
    }
    const _handleUnstakeSuccess = (amount: TokenAmount, pool: PoolInfo, account: string) => {
      Toast.success(t('unstakeSuccess'))
      _addHarvestEarnedHistory()
      _addUnstakeHistory(amount, TRANSACTION_STATUS.SUCCESS, pool.tokenSymbol)
      _getUserInfo(pool, account)
      store.dispatch('updatePool', pool.poolId)
      unstakeAmount.value = undefined
    }

    onMounted(async () => {
      const { query } = route
      if (!poolInfo.value && query.poolId) {
        const pool = await getPoolInfo(Number(query.poolId))
        store.dispatch('setCurrentPool', pool)
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
        stakedTokenAmount.value = undefined
        baseUnstakeAmount.value = undefined
      }
    })

    return {
      poolInfo,
      title,
      account,

      isConnected,
      unstakeAmount,
      baseUnstakeAmount,
      percentToUnsake,
      unstakeButtonDisable,
      sliderDisable,
      stakedTokenAmount,
      isUnstakeGreaterThanStakedAmount,
      showConfirmDialog,

      t,
      shortenAddress,
      updateDialogShow,
      onUnstake,
      onUnstakeMax,
      onConnect,
      onConfirm,
    }
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
@import '../../scss/mixin';
.unstake-page {
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
  .tips {
    line-height: 20px;
    margin-top: 10px;
    font-weight: 500;
    color: #2a3037;
  }
}
</style>
