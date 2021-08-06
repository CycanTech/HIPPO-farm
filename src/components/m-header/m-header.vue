<template>
  <header class="header">
    <div class="avatar">
      <img src="./logo.png" />
    </div>
    <div class="langs-connector-wrapper">
      <langs class="langs" />
      <connector
        class="connector"
        @connect="showWalletModel = true"
        @show-account-model="showAccountModel = true"
      />
    </div>
  </header>
  <div class="connector-mobile">
    <connector
      class="connector"
      @connect="showWalletModel = true"
      @show-account-model="showAccountModel = true"
    />
  </div>
  <WalletModel v-model="showWalletModel" />
  <AccountModel v-model="showAccountModel" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import Langs from '../langs/langs.vue'
import Connector from '../connector/connector.vue'
import WalletModel from '../wallet-model/wallet-model.vue'
import AccountModel from '../account-modal/account-modal.vue'
import { State } from '@/store/state-types'

export default defineComponent({
  components: {
    Langs,
    Connector,
    WalletModel,
    AccountModel,
  },
  setup() {
    const store = useStore<State>()

    const showWalletModel = computed({
      get() {
        return store.state.showWalletModel
      },
      set(newValue: boolean) {
        store.dispatch('changeShowWalletModel', newValue)
      },
    })
    const showAccountModel = ref<boolean>(false)

    return {
      showWalletModel,
      showAccountModel,
    }
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
@import '../../scss/mixin.scss';
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  top: 0;
  height: 80px;
  padding: 0 43px;
  background: #29294b;
  .avatar {
    display: flex;
    justify-content: center;
    img {
      width: 130px;
      height: 50px;
    }
  }
  .langs-connector-wrapper {
    display: flex;
    align-items: center;
    .langs {
      margin-right: 20px;
    }
  }
}
.connector-mobile {
  display: none;
}
@include mobile {
  .header {
    padding: 0 20px;
    .langs-connector-wrapper {
      .langs {
        margin-right: 0;
      }
      .connector {
        display: none;
      }
    }
  }
  .connector-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    z-index: 1;
    height: 60px;
    padding: 0 20px;
    background: #29294b;
    .connector {
      flex: 1;
    }
  }
}
</style>
