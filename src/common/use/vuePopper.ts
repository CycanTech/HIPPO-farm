import { ref, getCurrentInstance, onBeforeUnmount, watch, toRefs, Slots, Ref, PropType } from 'vue'

import { createPopper as createPopperFn, Instance, Placement, Options } from '@popperjs/core'

const stop = (e: Event) => e.stopPropagation()

export interface VuePopperProps {
  placement: Placement
  boundariesPadding?: number
  reference: HTMLElement
  popper: HTMLElement
  modelValue: boolean
  visibleArrow: boolean
  appendToBody: boolean
  popperOptions: Options
  disabled: boolean
}

const vuePopperProps = {
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom',
  },
  boundariesPadding: {
    type: Number,
    default: 5,
  },
  reference: {},
  popper: {},
  modelValue: Boolean,
  visibleArrow: Boolean,
  appendToBody: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  popperOptions: {
    type: Object,
  },
}

function useVuePopper(
  props: VuePopperProps,
  {
    emit,
    slots,
    referenceEl,
  }: {
    emit: (name: string, ...args: unknown[]) => void
    slots: Slots
    referenceEl: Ref<Element | null>
  }
) {
  const {
    placement,
    reference,
    popper,
    modelValue,
    visibleArrow,
    appendToBody,
    popperOptions,
    disabled,
  } = toRefs(props)

  const showPopper = ref(false)
  const currentPlacement = ref<Placement>()
  const popperElm = ref<HTMLElement>()
  const popperJS = ref<Instance>()
  const instance = getCurrentInstance()

  function createPopper() {
    currentPlacement.value = currentPlacement.value || placement.value
    if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(currentPlacement.value)) {
      return
    }
    const options = popperOptions.value
    const popperRef = (popperElm.value =
      popperElm.value || (popper && popper.value) || instance?.proxy?.$refs.popper)

    let referenceRef = (referenceEl.value =
      referenceEl.value || (reference && reference.value) || instance?.proxy?.$refs.reference)

    if (!referenceRef && slots.reference && slots.reference() && slots.reference()[0]) {
      referenceRef = referenceEl.value = slots.reference()[0].el as Element
    }

    if (!popperRef || !referenceRef) {
      return
    }
    if (visibleArrow.value) {
      appendArrow(popperRef)
    }
    if (appendToBody.value) {
      document.body.appendChild(popperElm.value)
    }
    if (popperJS.value && popperJS.value.destroy) {
      popperJS.value.destroy()
    }

    options.placement = currentPlacement.value
    popperJS.value = createPopperFn(referenceRef, popperRef, options)

    // popperJS.value._popper.style.zIndex = PopupManager.nextZIndex()
    popperElm.value.addEventListener('click', stop)
  }

  function updatePopper() {
    const popperJSRef = popperJS.value
    if (popperJSRef) {
      popperJSRef.update()
    } else {
      createPopper()
    }
  }

  function doDestroy(forceDestroy: boolean) {
    if (!popperJS.value || (showPopper.value && !forceDestroy)) {
      return
    }
    popperJS.value.destroy()
    popperJS.value = undefined
  }

  function destroyPopper() {
    popperJS.value?.destroy()
  }

  const appended = ref(false)
  function appendArrow(element: HTMLElement) {
    let hash

    if (appended.value) {
      return
    }

    appended.value = true

    for (const item in element.attributes) {
      if (/^_v-/.test(element.attributes[item].name)) {
        hash = element.attributes[item].name
        break
      }
    }

    const arrow = document.createElement('div')

    if (hash) {
      arrow.setAttribute(hash, '')
    }
    arrow.setAttribute('x-arrow', '')
    arrow.className = 'popper__arrow'
    element.appendChild(arrow)
  }

  watch(
    modelValue,
    (val) => {
      showPopper.value = val
      emit('update:modelValue', val)
    },
    {
      immediate: true,
    }
  )

  watch(showPopper, (val) => {
    if (disabled.value) return
    val ? updatePopper() : destroyPopper()
    emit('update:modelValue', val)
  })

  onBeforeUnmount(() => {
    doDestroy(true)
    if (popperElm.value && popperElm.value.parentNode === document.body) {
      popperElm.value.removeEventListener('click', stop)
      document.body.removeChild(popperElm.value)
    }
  })

  return {
    showPopper,
    currentPlacement,
    popperElm,
    popperJS,
    createPopper,
    updatePopper,
    doDestroy,
    destroyPopper,
    appendArrow,
  }
}

export { vuePopperProps, useVuePopper }
