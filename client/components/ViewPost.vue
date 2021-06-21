<template>
  <div class="view-post">
    {{ post.text }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Post from '../models/Post';


export default Vue.extend({
  props: {
    post: {
      type: Object as  PropType<Post>
    },
  },
});
</script>

<style scoped>

.view-post {
  border: 1px solid blue;
}


</style>
