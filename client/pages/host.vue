<template>
  <div>
    <p>Connected: {{ connected }}</p>
    <p>Persistent ID: {{ persistentId }}</p>
    <p>Room name: {{ roomName }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { MessageType, ServerMessage } from "../../messages";

const PERSISTENT_ID_KEY = "persistentId";

export default Vue.extend({
  data: () => ({
    connected: false,
    roomName: undefined,
    participants: [],
    persistentId: undefined,
  }),
  mounted() {
    const localStorageKey = `${this.$config.stage}/${PERSISTENT_ID_KEY}`;
    if (window.localStorage && window.localStorage[localStorageKey] != null) {
      this.persistentId = window.localStorage[localStorageKey];
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
      this.connected = true;
      this.socket.send(
        JSON.stringify({
          type: MessageType.SCRUM_MASTER_LOGIN,
          persistentId: this.persistentId,
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
      this.persistentId = persistentId;
    },
  },
});
</script>

<style scoped>
</style>
