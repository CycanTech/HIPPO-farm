import i18n from '@/i18n'
import { Dialog } from '@/components/dialog'

export default function (url: string): void {
  Dialog({
    content: i18n.global.t('jumpTips'),
    confirmText: i18n.global.t('confirm'),
    cancelText: i18n.global.t('cancel'),
    cancel: true,
    onConfirm: () => {
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('target', '_blank')
      a.click()
    },
  })
}
