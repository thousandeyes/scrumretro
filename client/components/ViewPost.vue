<template>
  <div class="view-post">
    <template v-if="masked">
      <em class="post-content">Comments are masked</em>
    </template>
    <template v-else>
      <ParticipantBadge
        v-if="post.participant"
        :participant="post.participant"
      />
      <span class="post-content"> {{ post.text }} </span>
      <button class="delete-post-btn" @click="() => onPostDeleted(post.postId)">
        ❌
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Post from "../models/Post";
import ParticipantBadge from "./ParticipantBadge.vue";

export default Vue.extend({
  components: { ParticipantBadge },
  props: {
    post: { type: Object as PropType<Post> },
    masked: { type: Boolean, default: false },
    adminMode: { type: Boolean, default: true },
    onPostDeleted: {
      type: Function as PropType<(postId: string) => void>,
      default: () => {}
    }
  }
});
</script>

<style scoped>
.view-post {
  position: relative;
  border-radius: 3px;
  border: 1px solid #ddd;
  background-color: #fafafa;
  display: flex;
  cursor: pointer;
}
.post-content {
  flex-grow: 3;
  text-align: center;
  color: #444;
  padding: 5px;
  border-left: 1px solid #ddd;
}
.participant-badge {
  flex-shrink: 0;
  margin: 5px;
}
.delete-post-btn {
  right: 0;
  padding: 5px;
  width: 30px;
  position: absolute;
  display: none;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
}
.view-post:hover .delete-post-btn {
  display: block;
}
</style>
