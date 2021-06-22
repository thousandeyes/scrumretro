<template>
  <div class="column">
    <ColumnHeader
      :column="column"
      :onColumnOpened="onColumnOpened"
      :onColumnDeleted="onColumnDeleted"
      :adminMode="adminMode"
      :onColumnRenamed="onColumnRenamed"
    />
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

export default Vue.extend({
  components: { ColumnHeader, InputPost, ViewPost },
  props: {
    column: { type: Object as PropType<Column>, required: true },
    adminMode: { type: Boolean, default: true },
    onPostSubmit: {
      type: Function as PropType<(columnId: string, content: string) => void>,
      default: () => {}
    },
    onColumnOpened: {
      type: Function as PropType<(columnId: string, isOpen: boolean) => void>,
      default: () => {}
    },
    onColumnRenamed: {
      type: Function as PropType<(columnId: string, columnName: string) => void>,
      default: () => {}
    },
    onColumnDeleted: {
      type: Function as PropType<(columnId: string) => void>,
      default: () => {}
    }
  },
  computed: {
    noPosts() {
      return this.column.posts.length === 0;
    }
  },
  methods: {
    onPost(text: string) {
      this.onPostSubmit(this.column.columnId, text);
    }
  }
});
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
