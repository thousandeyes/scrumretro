<template>
  <div class="post-container">
    <InputPost />
  </div>
</template>

<script lang="ts">
import InputPost from '../components/InputPost.vue';

export default {
  components: { InputPost },  
};
</script>

<style scoped>
.post-container {
  width:  200px;
  height: 200px;
  border: 1px solid red;
}
</style>
