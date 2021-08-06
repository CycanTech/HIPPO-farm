import { App, getCurrentInstance, ComponentPublicInstance } from 'vue'
import { mountComponent } from '../../common/ts/mount-component'
import usePopupState from '../../common/use/usePopupState'
import MToast from './toast.vue'
import { ToastTypes, PositionType } from './props'
import { isObject } from '../../common/ts/utils'
import { withInstall } from '../../common/ts/with-install'

// eslint-disable-next-line
type ComponentInstance = ComponentPublicInstance<{}, any>

export type ToastOptions = {
  content?: string
  duration?: number
  position?: PositionType
  hasMask?: boolean
  type?: ToastTypes
}
const defaultOptions: ToastOptions = {
  content: '',
  duration: 3000,
  position: 'center',
  hasMask: false,
  type: ToastTypes.INFO,
}

function parseOptions(message: string | ToastOptions): ToastOptions {
  if (isObject(message)) {
    return message
  }
  return { content: message }
}

function createInstance() {
  const { instance } = mountComponent({
    setup() {
      const { open, state, close, toggle } = usePopupState()

      const attrs: Record<string, unknown> = {
        'onUpdate:show': toggle,
      }

      const render = () => {
        return <MToast {...state} {...attrs} />
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

let instance: ComponentInstance
function getInstance() {
  if (!instance) {
    instance = createInstance()
  }
  return instance
}

function Toast(options: string | ToastOptions = {}): ComponentInstance {
  const toast = getInstance()
  const parsedOptions = parseOptions(options)
  toast.open(Object.assign({}, defaultOptions, parsedOptions))

  return toast
}

const createMethod = (ops: ToastOptions) => (options?: string | ToastOptions) => {
  Toast(Object.assign({}, parseOptions(options ?? ''), ops))
}

Toast.loading = createMethod({ type: ToastTypes.LOADING, duration: 0, hasMask: true })
Toast.success = createMethod({ type: ToastTypes.SUCCESS })
Toast.info = createMethod({ type: ToastTypes.INFO })

Toast.clear = () => {
  const toast = getInstance()
  toast.clear()
}

Toast.install = (app: App) => {
  app.use(withInstall<typeof MToast>(MToast))
  app.config.globalProperties.$toast = Toast
}

export { Toast }
