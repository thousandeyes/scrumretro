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
  <ViewColumns
    :columns="room.columns"
    :adminMode="true"
    :onNewColumn="onNewColumn"
    :onColumnOpened="onColumnOpened"
    :onColumnRenamed="onColumnRenamed"
    :onColumnDeleted="onColumnDeleted"
    :onPostDeleted="onPostDeleted"
  />
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import { MessageType } from "../../../messages";
import socketService from "../../lib/socketService";
import ViewColumns from "../ViewColumns.vue";

export default Vue.extend({
  components: { ViewColumns },
  computed: {
    ...mapGetters({
      room: "room/getHostRoom"
    })
  },
  methods: {
    onNewColumn() {
      socketService.send({
        type: MessageType.SCRUM_MASTER_ADD_COLUMN,
        persistentId: this.room.persistentId
      });
    },
    onColumnDeleted(columnId: string) {
      socketService.send({
        type: MessageType.DELETE_COLUMN,
        roomName: this.room.roomName,
        columnId
      });
    },
    onColumnOpened(columnId: string, isOpen: boolean) {
      socketService.send({
        type: MessageType.CHANGE_COLUMN_OPEN_STATE,
        roomName: this.room.roomName,
        columnId,
        isOpen
      });
    },
    onColumnRenamed(columnId: string, columnName: string) {
      socketService.send({
        type: MessageType.CHANGE_COLUMN_NAME,
        roomName: this.room.roomName,
        columnId,
        columnName
      });
    },
    onPostDeleted(postId: string) {
      socketService.send({
        type: MessageType.DELETE_POST,
        roomName: this.room.roomName,
        postId
      });
    }
  }
});
</script>
