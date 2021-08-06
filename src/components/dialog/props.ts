import { PropType } from 'vue'

export type TransitionType =
  | 'm-slide-up'
  | 'm-slide-down'
  | 'm-slide-right'
  | 'm-slide-left'
  | 'm-zoom'
  | 'm-fade'
  | 'm-bounce'

export default {
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  hasMask: {
    type: Boolean,
    default: true,
  },
  maskClosable: {
    type: Boolean,
    default: false,
  },
  transition: {
    type: String as PropType<TransitionType>,
    default: 'm-fade',
  },
  preventScroll: {
    type: Boolean,
    default: false,
  },
  preventScrollExclude: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
  cancel: {
    type: Boolean,
    default: false,
  },
  confirm: {
    type: Boolean,
    default: false,
  },
}
