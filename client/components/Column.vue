<!--
 Copyright (C) 2022 Cisco Systems, Inc. and its affiliates
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

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
          <ViewPost
            :post="post"
            :masked="adminMode && column.isOpen"
            :adminMode="adminMode"
            :onPostDeleted="onPostDeleted"
          />
        </div>
        <h3 class="no-posts" v-if="noPosts">
          <template v-if="column.isOpen"> You can now add posts </template>
          <template v-else>No posts</template>
        </h3>
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
    adminMode: { type: Boolean, default: false },
    onPostSubmit: {
      type: Function as PropType<(columnId: string, content: string) => void>,
      default: () => {}
    },
    onColumnOpened: {
      type: Function as PropType<(columnId: string, isOpen: boolean) => void>,
      default: () => {}
    },
    onColumnRenamed: {
      type: Function as PropType<
        (columnId: string, columnName: string) => void
      >,
      default: () => {}
    },
    onColumnDeleted: {
      type: Function as PropType<(columnId: string) => void>,
      default: () => {}
    },
    onPostDeleted: {
      type: Function as PropType<(postId: string) => void>,
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
  padding: calc(10px / 2) 0;
  height: 100%;
  border-radius: 3px;
  border: 1px solid #ddd;
  overflow-y: auto;
}

.column-item {
  padding: calc(10px / 2) 10px;
}

.post-input {
  height: 100px;
}

.no-posts {
  text-align: center;
}
</style>
