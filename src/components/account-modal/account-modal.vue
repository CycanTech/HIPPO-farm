<template>
  <popup v-model="showModel">
    <div class="model-wrapper">
      <div class="model-header">
        <h1>{{ t('account') }}</h1>
        <img src="./colse.png" @click="showModel = false" />
      </div>
      <div class="model-content">
        <div class="linked">
          <span>{{ t('linkedTo') }}</span>
          <button class="disconnect" @click="onDisconnect">
            {{ t('disconnect') }}
          </button>
        </div>
        <div class="account">
          {{ account }}
        </div>
        <div class="view-explorer" @click="jump(`https://bscscan.com/address/${account}`)">
          {{ t('viewBscScan') }}
        </div>
        <div class="btns">
          <button class="cancel" @click="showModel = false">
            {{ t('cancel') }}
          </button>
          <button class="copy" @click="copy(account)">
            {{ t('copyAddress') }}
          </button>
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
import jump from '../../common/ts/jump'
import { Toast } from '../toast'

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

    const copy = (toCopy: string) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(toCopy)
        Toast.success(t('copySuccessTips'))
      }
    }
    const onDisconnect = () => {
      showModel.value = false
      store.dispatch('handleDisconnect')
    }

    return {
      showModel,
      account: computed(() => store.state.userInfo.account),

      t,
      copy,
      jump,
      onDisconnect,
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
  border-radius: 6px;
  max-width: 420px;
  margin: 0 auto;
  .model-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 50px;
    border-radius: 6px 6px 0 0;
    border-bottom: 1px solid #e4e4e4;
    h1 {
      font-size: 16px;
      color: #212140;
      font-weight: 500;
    }
    img {
      position: absolute;
      right: 22px;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 12px;
      cursor: pointer;
    }
    @include mobile {
      height: 40px;
    }
  }
  .model-content {
    padding: 28px 20px;
    .linked {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      color: #000;
      font-size: 16px;
      font-weight: 400;
      button {
        padding: 0 12px;
        height: 40px;
        background: #d52282;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #fff;
        outline: none;
        border: 0;
        cursor: pointer;
      }
    }
    .account {
      background: #f3f6ff;
      border-radius: 10px;
      padding: 13px;
      font-size: 14px;
      font-weight: 500;
      color: #000;
      word-wrap: break-word;
    }
    .view-explorer {
      text-align: center;
      margin: 22px 0;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #ff9407;
      text-decoration: underline;
    }
    .btns {
      display: flex;
      justify-content: space-between;
      button {
        cursor: pointer;
        width: 138px;
        line-height: 48px;
        height: 48px;
        border-radius: 6px;
        text-align: center;
        font-size: 16px;
        font-weight: 500;
        outline: none;
        border: 0;
        cursor: pointer;
      }
      .cancel {
        color: #d52282;
        border: 1px solid #d52282;
        box-sizing: border-box;
        background: #fff;
      }
      .copy {
        background: #d52282;
        color: #fff;
        margin-left: 15px;
      }
    }
  }
  @include mobile {
    max-width: 330px;
  }
}
</style>
