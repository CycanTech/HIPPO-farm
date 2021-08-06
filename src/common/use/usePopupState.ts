import { reactive, nextTick } from 'vue'
import useExpose from './useExpose'

export default function usePopupState(): {
  // eslint-disable-next-line
  open: (props: Record<string, any>) => void
  close: () => void
  // eslint-disable-next-line
  state: Record<string, any>
  toggle: (show: boolean) => void
} {
  const state = reactive({
    show: false,
  })

  const toggle = (show: boolean) => {
    state.show = show
  }
  // eslint-disable-next-line
  const open = (props: Record<string, any>) => {
    Object.assign(state, props)
    nextTick(() => toggle(true))
  }

  const close = () => toggle(false)

  useExpose({ open, close, toggle })

  return {
    open,
    close,
    state,
    toggle,
  }
}
