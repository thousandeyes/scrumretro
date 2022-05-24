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
    adminMode: { type: Boolean, default: false },
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
