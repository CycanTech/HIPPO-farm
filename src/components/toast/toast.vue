<template>
  <div class="m-toast" :class="[position]">
    <m-popup
      v-model="visible"
      @show="onPopupShow"
      @hide="onPopupHide"
      :hasMask="hasMask"
      :maskClosable="false"
    >
      <div class="m-toast-content" v-if="$slots.default">
        <slot></slot>
      </div>
      <div class="m-toast-content" v-else>
        <div class="m-toast-icon" v-if="hasIconTypes.includes(type)">
          <template v-if="type === ToastTypes.SUCCESS">
            <img class="m-toast-img" :src="require('./success.png')" />
          </template>
          <template v-else>
            <loading />
          </template>
        </div>
        <div class="m-toast-text" v-if="content" v-text="content"></div>
      </div>
    </m-popup>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, toRefs, computed, watch } from 'vue'
import Popup from '../popup/popup.vue'
import Loading from '../loading/index.vue'
import props, { ToastTypes } from './props'

const hasIconTypes = [ToastTypes.SUCCESS, ToastTypes.LOADING]

export default defineComponent({
  name: 'm-toast',
  components: {
    [Popup.name]: Popup,
    Loading,
  },
  props: { ...props },
  emits: ['model-show', 'model-hide', 'update:show'],
  setup(props, { emit }) {
    const { duration, hasMask, position, type, content, show } = toRefs(props)

    let timer: number

    const visible = computed({
      get: () => show.value,
      set: (show) => {
        emit('update:show', show)
      },
    })

    watch(show, (show) => {
      if (show) {
        fire()
      }
    })

    const onPopupShow = () => {
      emit('model-show')
    }
    const onPopupHide = () => {
      emit('model-hide')
    }

    const fire = () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (visible.value && duration.value) {
        timer = window.setTimeout(() => {
          visible.value = false
        }, duration.value)
      }
    }

    onBeforeUnmount(() => {
      if (timer) {
        clearTimeout(timer)
      }
    })

    return {
      type,
      hasMask,
      visible,
      content,
      position,

      ToastTypes,
      hasIconTypes,

      onPopupHide,
      onPopupShow,
    }
  },
})
</script>

<style lang="scss">
.m-toast {
  .m-popup {
    z-index: 999999;
  }
  .m-popup {
    .m-popup-box {
      max-width: 540px;
      display: flex;
      justify-content: center;
    }
    .m-popup-mask {
      background: transparent;
    }
  }
  &.bottom {
    .m-popup .m-popup-box {
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  &.top {
    .m-popup .m-popup-box {
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

.m-toast-content {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  min-width: 80px;
  margin: 0 auto;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  text-align: left;
  line-height: 1.42857142;
  color: #fff;
  background-color: rgba($color: #000000, $alpha: 0.8);
  box-sizing: border-box;
  overflow: hidden;
}
.m-toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  img {
    height: 30px;
    width: 30px;
  }
}
.m-toast-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
