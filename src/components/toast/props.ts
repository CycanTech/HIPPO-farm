import { PropType } from 'vue'

export type PositionType = 'bottom' | 'top' | 'left' | 'right' | 'center'
export enum ToastTypes {
  SUCCESS = 'success',
  INFO = 'info',
  LOADING = 'loading',
}

export default {
  content: {
    type: [String, Number],
    default: '',
  },
  duration: {
    type: Number,
    default: 0,
  },
  position: {
    type: String as PropType<PositionType>,
    default: 'center',
  },
  hasMask: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<ToastTypes>,
    default: ToastTypes.INFO,
  },
  show: {
    type: Boolean,
    default: false,
  },
}
