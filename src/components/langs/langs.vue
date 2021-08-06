<template>
  <div class="langs" @click="toggle">
    <span>{{ current === LOCALES.ZH ? 'EN' : '中文' }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setItem } from '../../common/ts/utils'
import { LOCALES, LANGUAGE_KEY, getCurrentLang, isLocale } from '../../i18n/utils'

export default defineComponent({
  setup() {
    const current = ref(getCurrentLang())
    const route = useRoute()
    const router = useRouter()
    const { locale } = useI18n()

    const lang = computed(() => {
      const urlLang = route.path.split('/')[1]
      return isLocale(urlLang) ? urlLang : getCurrentLang()
    })

    const handleRouterPathChange = (): void => {
      if (current.value === lang.value) {
        return
      }
      toggle()
    }
    const toggle = (): void => {
      current.value = current.value === LOCALES.EN ? LOCALES.ZH : LOCALES.EN
      locale.value = current.value
      setItem(LANGUAGE_KEY, current.value)
      router.replace({
        path: route.path.replace(/\/(zh-CN|en-US)(?=\/?)/, `/${current.value}`),
        query: route.query,
        params: route.params,
      })
    }

    watch(() => router.currentRoute.value.path, handleRouterPathChange)

    return {
      LOCALES,
      current,

      toggle,
    }
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
.langs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  width: 60px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #3d3f68;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
}
</style>
