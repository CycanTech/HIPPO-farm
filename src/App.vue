<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { State } from './store/state-types'

export default defineComponent({
  name: 'App',
  setup() {
    const store = useStore<State>()
    const isConnected = computed<boolean>(() => store.getters.isConnected)
    const isLoadingPools = computed(() => store.state.isLoadingPools)

    store.dispatch('getPools')

    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', ([address]: string[]) => {
        store.dispatch('handleAccountChange', address)
      })
    }

    watch([isConnected, isLoadingPools], ([isConnected, isLoadingPools]) => {
      if (isConnected && !isLoadingPools) {
        store.dispatch('updatePools')
      }
    })
    watch([isConnected], ([isConnected]) => {
      if (!isConnected) {
        store.dispatch('getPools')
      }
    })
  },
})
</script>

<style lang="scss">
#app {
  height: 100%;
}
</style>
