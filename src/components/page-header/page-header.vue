<template>
  <div class="page-header">
    <span>{{ title }}</span>
    <img src="./colse.png" @click="back" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  props: {
    title: {
      type: String,
    },
  },
  setup() {
    const router = useRouter()

    const back = () => {
      router.go(-1)
    }

    return {
      back,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/variable.scss';
@import '../../scss/mixin.scss';
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 50px;
  font-size: 18px;
  color: #212140;
  font-weight: 500;
  border-radius: 6px 6px 0 0;
  border-bottom: 1px solid #e4e4e4;
  img {
    position: absolute;
    right: 22px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    cursor: pointer;
  }
  @include mobile {
    height: 40px;
  }
}
</style>
