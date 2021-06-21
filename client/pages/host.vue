<template>
  <div>
    <RoomDetails :room="room" />
    <ViewColumns :columns="room.columns" :adminMode="true" :onNewColumn="onNewColumn" />
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
    const id1 = `Column ${randomId()}`;

    return {
      room: {
        columns: [
          {
            columnId: id1,
            columnName: id1,
            isOpen: true,
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
        case MessageType.ROOM_JOINED:
          this.room.roomName = message.roomName;
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
    onNewColumn() {
      const id = `Column ${randomId()}`;
      this.room.columns.push({
        columnId: id,
        columnName: id,
        isOpen: false,
        posts: [],
      });
    },
  },
});

function randomId() {
  return Math.floor(Math.random() * 10000000000);
}
</script>

<style scoped>
</style>
