<!--
 Copyright 2022 Cisco Systems, Inc. and its affiliates
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
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
