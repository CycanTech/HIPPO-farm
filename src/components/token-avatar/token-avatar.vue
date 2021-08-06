<template>
  <img class="token-avatar" :src="src" @error="onLoadError" :width="width" :height="height" />
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, ref } from 'vue'
import { Token } from '@cointribute/pancakeswap-sdk-v2'

const defaultPath = '/imgs/default.png'

export default defineComponent({
  props: {
    token: {
      type: Object as PropType<Token>,
      required: true,
    },
    height: {
      type: Number,
    },
    width: {
      type: Number,
    },
  },
  setup(props) {
    const { token } = toRefs(props)
    const src = ref<string>(`/imgs/${token.value?.address?.toLocaleLowerCase()}.png`)

    const onLoadError = () => {
      src.value = defaultPath
    }

    return {
      src: src,

      onLoadError,
    }
  },
})
</script>

<style lang="scss" scoped>
.token-avatar {
  display: block;
  border-radius: 50%;
}
</style>
