<template>
  <div class="m-page">
    <page-header :title="title" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageHeader from '../../components/page-header/page-header.vue'
export default defineComponent({
  props: {
    title: {
      type: String,
    },
  },
  components: {
    PageHeader,
  },
})
</script>

<style lang="scss">
@import '../../scss/variable.scss';
@import '../../scss/mixin.scss';
.m-page {
  position: relative;
  max-width: 400px;
  min-height: 333px;
  background: #fff;
  border-radius: 6px;
  margin: 140px auto 0 auto;
  @include mobile {
    margin: 20px;
    max-width: 100%;
  }
}
</style>
