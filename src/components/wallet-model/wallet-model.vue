<template>
  <popup v-model="showModel" position="bottom">
    <div class="model-wrapper">
      <div class="model-header">
        <h1>{{ t('selectwallet') }}</h1>
        <img class="close" src="./close.png" @click="showModel = false" />
      </div>
      <div class="model-content">
        <div class="wallet-list">
          <div class="wallet" v-for="(item, index) in wallets" :key="index" @click="connect(item)">
            <span>{{ item.name }}</span>
            <img :src="item.logo" />
          </div>
        </div>
      </div>
    </div>
  </popup>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'
import Popup from '../popup/popup.vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '../../store/state-types'
const wallets = [
  {
    name: 'Binance Chain Wallet',
    logo: require('./BinanceChainWallet.png'),
  },
  {
    name: 'MathWallet',
    logo: require('./MathWallet.png'),
  },

  {
    name: 'Metamask',
    logo: require('./Metamask.png'),
  },
]
export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
    },
  },
  components: {
    Popup,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const { t } = useI18n()
    const store = useStore<State>()

    const showModel = computed<boolean>({
      get() {
        return modelValue.value
      },
      set(newValue) {
        emit('update:modelValue', newValue)
      },
    })

    const connect = () => {
      showModel.value = false
      store.dispatch('handleConnect')
    }

    return {
      showModel,
      wallets,

      t,
      connect,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/mixin';
.model-wrapper {
  background: #fff;
  overflow: hidden;
  margin: 0 20px;
  border-radius: 20px 20px 0 0;
  max-width: 420px;
  margin: 0 auto;
  .model-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 74px;
    background: #f6f8f9;
    padding: 0 20px;
    h1 {
      font-size: 20px;
      font-weight: 500;
      color: #2a3037;
    }
    .close {
      height: 20px;
      width: 20px;
    }
  }
  .model-content {
    .wallet-list {
      padding: 10px 0 30px 0;
      .wallet {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 52px;
        background: rgba(#3d3f68, 0.05);
        border-radius: 29px;
        font-size: 18px;
        font-weight: 500;
        color: #000;
        margin: 13px;
        padding: 0 20px;
        cursor: pointer;
        img {
          height: 40px;
          width: 40px;
        }
      }
    }
  }
}
</style>
