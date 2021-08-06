<template>
  <div class="range">
    <input :disabled="disabled" type="range" min="0" max="100" v-model="range" />
    <div class="bar" :style="{ width: `${range}%` }" />
    <span class="value" :style="{ left: `${range}%` }">{{ range }}%</span>
    <ul class="dots">
      <li v-for="item in DOTS" :key="item" :class="{ active: range > item }" />
    </ul>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'

const DOTS = [0, 25, 50, 75, 100]

export default defineComponent({
  props: {
    modelValue: {
      type: [String, Number],
      default: '0',
    },
    disabled: {
      type: [Boolean],
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)

    const range = computed<string | number>({
      get() {
        return modelValue.value
      },
      set(newValue) {
        emit('update:modelValue', newValue)
      },
    })

    return {
      range,

      DOTS,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/mixin';
.range {
  display: flex;
  align-items: center;
  position: relative;
  height: 26px;
  .bar {
    position: absolute;
    height: 4px;
    top: 11px;
    background: #d52282;
    left: 0;
    z-index: 3;
    pointer-events: none;
  }
  .value {
    position: absolute;
    top: -15px;
    font-size: 14px;
    color: #212140;
    line-height: 13px;
    z-index: 6;
    transform: translateX(-50%);
  }
  .dots {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 0;
    pointer-events: none;
    li {
      position: relative;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #212140;
      &:first-child {
        transform: translateX(-5px);
      }
      &:last-child {
        transform: translateX(5px);
      }
      &.active {
        &::after {
          position: absolute;
          content: '';
          width: 16px;
          height: 16px;
          background: #d52282;
          top: 50%;
          left: 50%;
          transform: translate3d(-50%, -50%, 0);
          border-radius: 50%;
        }
      }
    }
  }
  input[type='range'] {
    z-index: 2;
    position: absolute;
    top: 11px;
    width: 100%;
    cursor: pointer;
    outline: none;
    margin: 0;
    padding: 0;
    border: 0;
    appearance: none;
    background: #212140;
    height: 4px;
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    &::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: #d52282;
      border-radius: 50%;
      margin: 0;
      padding: 0;
      border: 0;
    }
  }
}
</style>
