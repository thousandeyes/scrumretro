<template>
  <div>
    <RoomDetails :room="room" />
    <ViewColumns :columns="room.columns" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { MessageType, ServerMessage } from "../../messages";
import ViewColumns from '../components/ViewColumns.vue';
import RoomDetails from '../components/RoomDetails.vue';
import Room from '../models/Room';


const PERSISTENT_ID_KEY = "persistentId";

export default Vue.extend({
  components: { RoomDetails, ViewColumns },
  data(): { room: Room } {
    return {
      room: {
        columns: [
          {
            columnId: 'ID 1',
            columnName: 'Column 1',
            isOpen: true,
            posts: [],
          },
          {
            columnId: 'ID 2',
            columnName: 'Column 2',
            isOpen: false,
            posts: [],
          },
          {
            columnId: 'ID 3',
            columnName: 'Column 3',
            isOpen: false,
            posts: [],
          }
        ],
        connected: false,
        roomName: undefined,
        participants: [],
        persistentId: undefined,
      }
    }
  },
  mounted() {
    const localStorageKey = `${this.$config.stage}/${PERSISTENT_ID_KEY}`;
    if (window.localStorage && window.localStorage[localStorageKey] != null) {
      this.room.persistentId = window.localStorage[localStorageKey];
    }

    this.socket = new WebSocket(this.$config.websocketUrl);
    this.socket.onopen = () => this.socketOpened();
    this.socket.onmessage = (event) => this.onSocketMessage(event);
  },
  beforeDestroy() {
    this.socket.close();
  },
  methods: {
    socketOpened() {
      this.room.connected = true;
      this.socket.send(
        JSON.stringify({
          type: MessageType.SCRUM_MASTER_LOGIN,
          persistentId: this.room.persistentId,
        })
      );
    },
    onSocketMessage(event: MessageEvent) {
      const message: ServerMessage = JSON.parse(event.data);
      switch (message.type) {
        case MessageType.PERSISTENT_ID_GENERATED:
          this.savePersistentId(message.persistentId);
          break;
        default:
          console.warn('Unknown message received', {...message});
          break;
      }
    },
    savePersistentId(persistentId: string) {
      const localStorageKey = `${this.$config.stage}/${PERSISTENT_ID_KEY}`;
      window.localStorage[localStorageKey] = persistentId;
      this.room.persistentId = persistentId;
    },
  },
});
</script>

<style scoped>
</style>
