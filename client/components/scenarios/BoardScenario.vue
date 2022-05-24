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
