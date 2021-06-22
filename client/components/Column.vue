<template>
  <div class="column">
    <ColumnHeader :column="column" />
    <div class="column-container">
      <div v-if="!adminMode && column.isOpen" class="post-input column-item">
        <InputPost :onPost="onPost" />
      </div>
      <div class="post-display">
        <div
          class="column-item"
          v-for="post in column.posts"
          :key="post.postId"
        >
          <ViewPost :post="post" />
        </div>
        <h3 class="no-posts" v-if="noPosts">No posts</h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import InputPost from "./InputPost.vue";
import ViewPost from "./ViewPost.vue";
import ColumnHeader from "./ColumnHeader.vue";
import Column from "../models/Column";
import Post from "../models/Post";

export default Vue.extend({
  components: { ColumnHeader, InputPost, ViewPost },
  props: {
    column: { type: Object as PropType<Column>, required: true },
    adminMode: { type: Boolean, default: true }
  },
  computed: {
    noPosts() {
      return this.column.posts.length === 0;
    }
  },
  methods: {
    onPost(text) {
      // TODO: send post to server
      // TEMP post creation
      const post: Post = {
        postId: `POST: ${randomId()}`,
        text: text,
        participant: {
          persistentId: "THIS ID!",
          participantName: "RUUUUIIIII"
        },
        submittedDate: Date.now() / 1000,
        columnId: this.column.columnId,
      };
      this.column.posts.unshift(post);
    }
  }
});

function randomId() {
  return Math.floor(Math.random() * 10000000000);
}
</script>

<style scoped>
.column {
  display: flex;
  flex-flow: column nowrap;
  width: 350px;
  padding: 10px;
}

.column-container {
  padding-top: calc(10px / 2);
  height: 100%;
  border-radius: 3px;
  border: 1px solid grey;
  overflow-y: auto;
}

.column-item {
  padding: calc(10px / 2) 10px;
}

.post-input {
  height: 100px;
}

.post-display {
  word-break: break-all;
}

.no-posts {
  text-align: center;
}
</style>
