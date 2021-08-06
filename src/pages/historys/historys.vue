<template>
  <m-page class="history-page" :title="t('history')">
    <a
      class="viewBSCScan"
      v-if="account"
      :href="`https://bscscan.com/address/${account}`"
      target="_blank"
    >
      {{ t('viewBSCScan') }}
    </a>
    <div class="historys">
      <div class="history" v-for="(item, i) in historys" :key="i">
        <div class="symbol">
          {{ t(types[item.transactionType]) }}
        </div>
        <div class="token-info">
          <span>{{ item.tokenSymbol }}</span>
        </div>
        <div class="amount-date">
          <div class="amount">
            <span>{{ item.tokenAmount.toSignificant(5) }}</span>
            <img :src="getIcon(item.status)" />
          </div>
          <div class="date">
            {{ `${dateFormat(item.date, 'yyyy-mm-dd')} ${dateFormat(item.date, 'HH:MM:ss')}` }}
          </div>
        </div>
      </div>
      <div class="empty" v-if="!historys.length">
        <img src="./nodata.png" />
        <p>{{ t('noHistory') }}</p>
      </div>
    </div>
  </m-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { State } from '../../store/state-types'
import dateFormat from 'dateformat'
import MPage from '../../components/m-page/m-page.vue'
import {
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_SYMBOLS,
} from '../../common//ts/TransactionHistory'

const types = {
  [TRANSACTION_TYPE.STAKE]: 'stake',
  [TRANSACTION_TYPE.UNSTAKE]: 'unstake',
  [TRANSACTION_TYPE.HARVEST_EARNED]: 'harvest',
}

export default defineComponent({
  components: {
    MPage,
  },
  setup() {
    const store = useStore<State>()
    const { t } = useI18n()
    const getIcon = (status: TRANSACTION_STATUS) => {
      return status === TRANSACTION_STATUS.SUCCESS
        ? require('./success.png')
        : require('./fail.png')
    }

    return {
      dateFormat,
      historys: computed(() => store.state.historys),
      account: computed(() => store.state.userInfo.account),
      TRANSACTION_TYPE,
      TRANSACTION_STATUS,
      TRANSACTION_SYMBOLS,
      types,

      t,
      getIcon,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/mixin';
.history-page {
  position: relative;
  .viewBSCScan {
    position: absolute;
    top: 15px;
    left: 20px;
    text-decoration: none;
    cursor: pointer;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 6px;
    border: 1px solid #d52282;
    font-size: 12px;
    color: #d52282;
    padding: 0 8px;
    @include mobile {
      top: 10px;
      left: 10px;
    }
  }
  .historys {
    .history {
      display: flex;
      position: relative;
      height: 70px;
      margin: 20px;
      background: #29294b;
      color: #fff;
      border-radius: 6px;
      .symbol {
        flex: 0.7;
        padding: 15px;
        font-size: 14px;
      }
      .token-info {
        display: flex;
        align-items: flex-start;
        flex: 1.6;
        padding: 15px 15px 10px 0;
        span {
          font-size: 14px;
        }
      }
      .amount-date {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        padding: 13px 15px 13px 0;
        flex: 2;
        .amount {
          display: flex;
          align-items: center;
          img {
            width: 18px;
            height: 18px;
            padding-left: 8px;
          }
        }
        .date {
          position: absolute;
          right: 15px;
          bottom: 13px;
          font-size: 12px;
          color: rgba($color: #fff, $alpha: 0.4);
        }
      }
      @include mobile {
        margin: 10px;
      }
    }
    .empty {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 333px;
      img {
        width: 164px;
        height: 126px;
      }
      p {
        text-align: center;
        margin-top: 20px;
        white-space: pre;
        line-height: 16px;
        font-size: 12px;
        color: #212140;
      }
    }
  }
}
</style>
