import { App } from 'vue'

const camelizeRE = /-(\w)/g
export function camelize(str: string): string {
  return str.replace(camelizeRE, (_, c) => c.toUpperCase())
}

type EventShim = {
  // eslint-disable-next-line
  new (...args: any[]): {
    $props: {
      // eslint-disable-next-line
      onClick?: (...args: any[]) => void
    }
  }
}

export type WithInstall<T> = T & {
  install(app: App): void
} & EventShim

// using any here because tsc will generate some weird results when using generics
// eslint-disable-next-line
export function withInstall<T>(options: any): WithInstall<T> {
  ;(options as Record<string, unknown>).install = (app: App) => {
    // eslint-disable-next-line
    const { name } = options as any
    app.component(name, options)
    app.component(camelize(`-${name}`), options)
  }

  return options
}
