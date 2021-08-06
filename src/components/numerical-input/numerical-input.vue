<template>
  <input
    class="numerical-input"
    type="text"
    :value="v"
    :disabled="disabled"
    @input="onChange"
    inputMode="decimal"
    title="Token Amount"
    autoComplete="off"
    autoCorrect="off"
    pattern="^[0-9]*[.,]?[0-9]*$"
    :placeholder="placeholder || 'Amount'"
    minLength="1"
    maxLength="79"
    spellCheck="false"
  />
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue'
import { escapeRegExp } from '../../common/ts//utils'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

export default defineComponent({
  props: {
    placeholder: {
      default: '',
      type: String,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    modelValue: {
      default: '',
      type: String,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)

    const v = computed<string>({
      get() {
        return modelValue.value
      },
      set(newValue) {
        emit('update:modelValue', newValue)
      },
    })

    const enforcer = (nextUserInput: string) => {
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        v.value = nextUserInput
      }
    }

    const onChange = ({ target }: { target: HTMLInputElement }) => {
      enforcer(target.value.replace(/,/g, '.'))
      v.value = target.value
    }

    return {
      v,

      onChange,
    }
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
.numerical-input {
  width: 100%;
  height: 100%;
  position: relative;
  font-weight: 500;
  outline: none;
  border: none;
  background-color: transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  -webkit-appearance: textfield;
  text-align: left;
  color: $color-text;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  &::placeholder {
    color: #999999;
  }
}
</style>
