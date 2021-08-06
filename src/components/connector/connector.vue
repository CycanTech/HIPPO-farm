<template>
  <div class="connector">
    <div class="connect" v-if="!isConnected" @click="connect">
      <img src="./wallet.png" />
      <span>{{ t('connect') }}</span>
    </div>
    <div class="address" v-else @click="showAccountModal">
      <img src="./wallet.png" />
      <span>{{ shortenAddress(account) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '../../store/state-types'
import { shortenAddress } from '../../common/ts/utils'

export default defineComponent({
  emits: ['connect', 'show-account-model'],
  setup(_, { emit }) {
    const store = useStore<State>()
    const { t } = useI18n()

    const connect = () => {
      emit('connect')
    }
    const showAccountModal = () => {
      emit('show-account-model')
    }

    return {
      account: computed(() => store.state.userInfo.account),
      isConnected: computed(() => store.getters.isConnected),

      t,
      connect,
      shortenAddress,
      showAccountModal,
    }
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
@import '../../scss/mixin.scss';
.connector {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  width: 230px;
  padding: 0 10px;
  font-size: 18px;
  cursor: pointer;
  background: #3d3f68;
  border-radius: 6px;
  color: #fff;
  .connect,
  .address {
    display: flex;
    align-items: center;
    flex: 1;
    img {
      height: 26px;
      width: 26px;
    }
    span {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      padding-left: 15px;
      @include mobile {
        text-align: right;
      }
    }
  }
}
</style>
