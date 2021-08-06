import { createApp, Component, ComponentPublicInstance } from 'vue'

export function mountComponent(RootComponent: Component): {
  instance: ComponentPublicInstance
  unmount(): void
} {
  const app = createApp(RootComponent)
  const root = document.createElement('div')

  document.body.appendChild(root)

  return {
    instance: app.mount(root),
    unmount() {
      app.unmount()
      document.body.removeChild(root)
    },
  }
}
