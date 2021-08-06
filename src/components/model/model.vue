<template>
  <popup v-model="showModel">
    <div class="model-wrapper">
      <div class="model-header">
        {{ title }}
      </div>
      <img class="close" src="./close.png" @click="showModel = false" />
      <div class="model-content">
        <slot></slot>
      </div>
    </div>
  </popup>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'
import Popup from '../../components/popup/popup.vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
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
    const showModel = computed<boolean>({
      get() {
        return modelValue.value
      },
      set(newValue) {
        emit('update:modelValue', newValue)
      },
    })

    return {
      showModel,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/mixin';
.model-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 606px;
  height: 517px;
  background: #283864;
  box-shadow: -3px 3px 5px rgba(10, 20, 48, 0.5);
  border-radius: 20px;
  .model-header {
    display: flex;
    justify-content: center;
    padding: 50px 0 30px 0;
    font-size: 28px;
    font-weight: 400;
  }
  .close {
    position: absolute;
    right: 30px;
    top: 30px;
    height: 30px;
    width: 30px;
    cursor: pointer;
  }
  .model-content {
    flex: 1;
  }
  @include mobile {
    width: 303px;
    height: 260px;
    border-radius: 10px;
    box-shadow: -3px 3px 5px rgba(10, 20, 48, 0.5);
    .model-header {
      padding: 25px 0 15px 0;
      font-size: 14px;
    }
    .close {
      position: absolute;
      right: 15px;
      top: 15px;
      height: 15px;
      width: 15px;
    }
  }
}
</style>
