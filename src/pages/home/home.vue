<template>
  <div class="global-wrapper">
    <m-header />
    <div class="home">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MHeader from '../../components/m-header/m-header.vue'

export default defineComponent({
  name: 'Home',
  components: {
    MHeader,
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/mixin';
.global-wrapper {
  position: relative;
  height: 100vh;
  padding-top: 80px;
  box-sizing: border-box;
  background: #29294b;
  .home {
    position: relative;
    height: 100%;
    overflow-y: scroll;
    @include no-scrollbar;
    background-image: url('./bg.png');
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: bottom;
    background-color: #222141;
    border-radius: 60px 60px 0px 0px;
  }
  @include mobile {
    padding-top: 140px;
    .home {
      border-radius: 30px 30px 0px 0px;
      background-image: url('./bg-mobile.png');
    }
  }
}
</style>
