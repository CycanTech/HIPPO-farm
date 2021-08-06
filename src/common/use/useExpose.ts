import { getCurrentInstance } from 'vue'

// eslint-disable-next-line
export default function useExpose(apis: Record<string, any>) {
  const instance = getCurrentInstance()
  if (instance) {
    Object.assign(instance.proxy, apis)
  }
}
