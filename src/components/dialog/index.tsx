import { App, getCurrentInstance, ComponentPublicInstance } from 'vue'
import { mountComponent } from '../../common/ts/mount-component'
import usePopupState from '../../common/use/usePopupState'
import MDialog from './dialog.vue'
import { TransitionType } from './props'
import { withInstall } from '../../common/ts/with-install'

// eslint-disable-next-line
type ComponentInstance = ComponentPublicInstance<{}, any>
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {}

export type DialogOptions = {
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  transition?: TransitionType
  cancel?: boolean
  confirm?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

const defaultOptions: DialogOptions = {
  title: '',
  content: '',
  confirmText: '',
  cancelText: '',
  transition: 'm-bounce',
  cancel: false,
  confirm: true,
  onConfirm: noop,
  onCancel: noop,
}

let queue: ComponentInstance[] = []

function createInstance() {
  const { instance, unmount } = mountComponent({
    setup() {
      const { open, state, close, toggle } = usePopupState()

      const onClosed = () => {
        queue = queue.filter((item) => item !== instance)
        unmount()
      }
      const attrs: Record<string, unknown> = {
        'onUpdate:show': toggle,
        onClosed,
        'onConfirm:click': () => state.onConfirm(),
        'onCancel:click': () => state.onCancel(),
      }

      const render = () => {
        return <MDialog {...state} {...attrs} />
      }
      // eslint-disable-next-line
      ;(getCurrentInstance() as any).render = render

      return {
        open,
        clear: close,
      }
    },
  })

  return instance
}

function getInstance() {
  const instance = createInstance()
  queue.push(instance)

  return queue[queue.length - 1]
}

function Dialog(options: DialogOptions = {}): ComponentInstance {
  const dialog = getInstance()
  dialog.open(Object.assign({}, defaultOptions, options))

  return dialog
}

Dialog.clear = (all?: boolean) => {
  if (queue.length) {
    if (all) {
      queue.forEach((toast) => {
        toast.clear()
      })
      queue = []
    } else {
      queue.shift()?.clear()
    }
  }
}

Dialog.install = (app: App) => {
  app.use(withInstall<typeof MDialog>(MDialog))
  app.config.globalProperties.$dialog = Dialog
}

export { Dialog }
