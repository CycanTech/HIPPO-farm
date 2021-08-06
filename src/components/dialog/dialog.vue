<template>
  <div class="m-dialog">
    <m-popup
      v-model="visible"
      :hasMask="hasMask"
      :maskClosable="maskClosable"
      :transition="transition"
      :preventScroll="preventScroll"
      :preventScrollExclude="preventScrollExclude"
      @hide="onHide"
      position="center"
    >
      <div class="m-dialog-content">
        <img class="hippo" src="./hippo.png" />
        <slot name="header" v-if="$slots.header"></slot>
        <div class="m-dialog-header" v-else-if="title">
          {{ title }}
        </div>
        <div class="m-dialog-body">
          <slot>
            <div class="m-dialog-text" v-html="content"></div>
          </slot>
        </div>
        <slot name="actions" v-if="$slots.actions"></slot>
        <template v-else>
          <footer class="m-dialog-actions">
            <div class="m-dialog-confirm" v-if="confirm" @click="onConfirm">
              {{ confirmText }}
            </div>
            <div class="m-dialog-cancel" v-if="cancel" @click="onCancel">
              {{ cancelText }}
            </div>
          </footer>
        </template>
      </div>
    </m-popup>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue'
import Popup from '../popup/popup.vue'
import props from './props'

export default defineComponent({
  name: 'm-dialog',
  components: {
    [Popup.name]: Popup,
  },
  props: { ...props },
  emits: ['update:show', 'cancel:click', 'confirm:click', 'closed'],
  setup(props, { emit }) {
    const {
      hasMask,
      show,
      maskClosable,
      transition,
      title,
      content,
      cancel,
      confirm,
      cancelText,
      confirmText,
      preventScroll,
      preventScrollExclude,
    } = toRefs(props)

    const visible = computed({
      get: () => show.value,
      set: (show) => {
        emit('update:show', show)
      },
    })

    const onConfirm = () => {
      visible.value = false
      emit('confirm:click')
    }
    const onCancel = () => {
      visible.value = false
      emit('cancel:click')
    }
    const onHide = () => {
      emit('closed')
    }

    return {
      visible,
      hasMask,
      maskClosable,
      transition,
      title,
      content,
      cancel,
      confirm,
      cancelText,
      confirmText,

      preventScroll,
      preventScrollExclude,

      onConfirm,
      onCancel,
      onHide,
    }
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
@import '../../scss/mixin.scss';
.m-dialog-content {
  position: relative;
  margin: 0 13px;
  overflow: hidden;
  min-height: 130px;
  max-width: 380px;
  min-width: 240px;
  background: #fff;
  box-shadow: -3px 3px 5px rgba(10, 20, 48, 0.5);
  border-radius: 20px;
  padding: 40px 20px 95px 130px;
  .hippo {
    position: absolute;
    left: 20px;
    top: 40px;
    width: 82px;
    height: 172px;
  }
  @include mobile {
    max-width: 320px;
    min-width: 240px;
    padding: 30px 20px 95px 90px;
    .hippo {
      zoom: 0.75;
    }
  }
}
.m-dialog-header {
  font-size: 18px;
  font-weight: 500;
  color: $color-text;
}
.m-dialog-body {
  position: relative;
  padding: 15px 0;
  color: $color-text;
  font-size: $font-size-medium-x;
  text-align: left;
  width: 100%;
  .m-dialog-text {
    display: flex;
    justify-content: center;
    font-size: 16px;
    color: $color-text;
    line-height: 28px;
    word-break: break-all;
  }
}
.m-dialog-actions {
  position: absolute;
  bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  > div {
    width: 100px;
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
    box-sizing: border-box;
    text-align: center;
    font-size: $font-size-medium-x;
    margin-left: 15px;
    cursor: pointer;
    border-radius: 6px;
    &:first-child {
      margin-left: 0;
    }
    @include mobile {
      width: 90px;
      height: 33px;
      line-height: 33px;
      font-size: 12px;
    }
    @include smallMobile {
      width: 80px;
      height: 33px;
    }
  }
  .m-dialog-cancel {
    border: 1px solid $color-theme;
    color: $color-theme;
  }
  .m-dialog-confirm {
    color: #fff;
    background: $color-theme;
  }
}
</style>
