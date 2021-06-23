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
