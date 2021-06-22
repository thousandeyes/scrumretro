<template>
  <div v-if="masked" class="view-post">
    <em>Comments are masked</em>
  </div>
  <div v-else class="view-post">
    {{ post.text }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Post from "../models/Post";

export default Vue.extend({
  props: {
    post: { type: Object as PropType<Post> },
    masked: { type: Boolean, default: false },
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
