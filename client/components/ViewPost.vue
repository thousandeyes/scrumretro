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
  text-align: center;
  color: #444;
  border-radius: 3px;
  border: 1px solid #ddd;
  background-color: #fafafa;
  padding: 5px;
}


</style>
