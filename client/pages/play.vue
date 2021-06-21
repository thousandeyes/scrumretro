<template>
  <div class="player-view">
    <p>Connected: {{connected}}</p>
    <p>Persistent ID: {{persistentId}}</p>
    <div v-if="roomName != null" class="play">
      <ViewColumns :columns="columns" />
    </div>
    <div v-else class="room-login-view">
      <h1>🃏 join room</h1>
      <div v-if="alertMsg" class="alert">{{ alertMsg }}</div>
      <div v-if="persistentId" class="alert">Please re-enter the room name to log back in</div>
      <fieldset>
        <label for="roomNameInput">Room Code</label>
        <input
          v-model="roomNameInputValue"
          placeholder="XKCD"
          type="text"
          name="roomNameInput"
          id="roomNameInput"
        />
      </fieldset>
      <fieldset>
        <label for="playerNameInput">Your Name</label>
        <input
          v-model="playerNameInputValue"
          placeholder="Mary Shelley"
          type="text"
          name="playerNameInput"
          id="playerNameInput"
        />
      </fieldset>
      <button
        type="button"
        class="join-button"
        :disabled="joinDisabled"
        @click="onJoinRoomClick"
      >
        Join
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Column from "../models/Column";
import ViewColumns from "../components/ViewColumns.vue";
import { MessageType, ParticipantLoginMessage, RoomJoinedMessage, ServerMessage } from "../../messages";

const PERSISTENT_ID_KEY = "participant/persistentId";

export default Vue.extend({
  components: { ViewColumns },
  data() {
    const columns: Column[] = [
      {
        columnId: "ID 1",
        columnName: "Column 1",
        isOpen: false,
        posts: [],
      },
      {
        columnId: "ID 2",
        columnName: "Column 2",
        isOpen: false,
        posts: [],
      },
    ];
    return {
      connected: false,
      roomName: undefined,
      columns,
      playerNameInputValue: "",
      roomNameInputValue: "",
      persistentId: undefined,
      alertMsg: undefined,
    };
  },
  computed: {
    joinDisabled(): boolean {
      return false;
    },
  },
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
    },
    onSocketMessage(event: MessageEvent) {
      const message: ServerMessage = JSON.parse(event.data);
      switch (message.type) {
        case MessageType.PERSISTENT_ID_GENERATED:
          this.savePersistentId(message.persistentId);
          break;
        case MessageType.ROOM_JOINED:
          this.roomJoined(message);
          break;
        case MessageType.ACTION_FAILED:
          this.alertMsg = message.details;
          break;
      }
    },
    savePersistentId(persistentId: string) {
      const localStorageKey = `${this.$config.stage}/${PERSISTENT_ID_KEY}`;
      window.localStorage[localStorageKey] = persistentId;
      this.persistentId = persistentId;
    },
    roomJoined(message: RoomJoinedMessage) {
      this.roomName = message.roomName;
      this.columns = message.columns;
    },
    onJoinRoomClick() {
      const message: ParticipantLoginMessage = {
        type: MessageType.PARTICIPANT_LOGIN,
        participantName: this.playerNameInputValue,
        roomName: this.roomNameInputValue.toUpperCase(),
        persistentId: this.persistentId,
      };
      this.socket.send(JSON.stringify(message));
    },
  },
});
</script>

<style scoped>
.room-login-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}
.alert {
    color: #cc0808;
    border: 1px solid #cc0808;
    padding: 15px 10px;
}
.room-login-view > fieldset {
    border: none;
    min-height: 48px;
    padding: 10px 0;
}
.room-login-view > fieldset + fieldset {
    margin-top: 10px;
}
.room-login-view > fieldset > input {
    display: block;
    font-size: 20px;
    width: 100%;
    margin-top: 5px;
}
.join-button {
    margin-top: 10px;
    height: 48px;
}
</style>