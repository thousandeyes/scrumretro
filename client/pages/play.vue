<template>
  <div class="player-view">
    <RoomDetails :persistentIdKey="persistentIdKey" :room="room" />
    <div v-if="alertMsg" class="alert">{{ alertMsg }}</div>
    <div v-if="room.roomName != null" class="play">
      <ViewColumns :columns="columns" />
    </div>
    <JoinRoom v-else :onJoinRoomClick="onJoinRoomClick" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Column from "../models/Column";
import ViewColumns from "../components/ViewColumns.vue";
import JoinRoom from "../components/JoinRoom.vue";
import RoomDetails from "../components/RoomDetails.vue";
import {
  MessageType,
  ParticipantLoginMessage,
  RoomJoinedMessage,
  ServerMessage
} from "../../messages";
import Room from "../models/Room";

const PERSISTENT_ID_KEY = "participant/persistentId";

export default Vue.extend({
  components: { RoomDetails, ViewColumns, JoinRoom },
  data(): State {
    const id = `Column ${randomId()}`;
    const columns: Column[] = [
      {
        columnId: id,
        columnName: id,
        isOpen: true,
        posts: []
      }
    ];
    return {
      persistentIdKey: PERSISTENT_ID_KEY,
      room: {
        connected: false,
        persistentId: undefined,
        columns,
        participants: []
      },
      alertMsg: undefined
    };
  },
  mounted() {
    const localStorageKey = `${this.$config.stage}/${PERSISTENT_ID_KEY}`;
    if (window.localStorage && window.localStorage[localStorageKey] != null) {
      this.room.persistentId = window.localStorage[localStorageKey];
    }

    this.socket = new WebSocket(this.$config.websocketUrl);
    this.socket.onopen = () => this.socketOpened();
    this.socket.onmessage = event => this.onSocketMessage(event);
  },
  beforeDestroy() {
    this.socket.close();
  },
  methods: {
    socketOpened() {
      this.room.connected = true;
    },
    onSocketMessage(event: MessageEvent) {
      const message: ServerMessage = JSON.parse(event.data);
      if (message.type == null) {
        this.alertMsg = "Whoops! Something went wrong, please try again later.";
        return;
      }
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
      this.room.persistentId = persistentId;
    },
    roomJoined({ roomName, columns }: RoomJoinedMessage) {
      Object.assign(this.room, { roomName, columns });
    },
    onJoinRoomClick(roomName: string, participantName: string) {
      const message: ParticipantLoginMessage = {
        type: MessageType.PARTICIPANT_LOGIN,
        participantName,
        roomName,
        persistentId: this.room.persistentId
      };
      this.socket.send(JSON.stringify(message));
    }
  }
});

interface State {
  persistentIdKey: string;
  room: Room;
  alertMsg?: string;
}

function randomId() {
  return Math.floor(Math.random() * 10000000000);
}
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
</style>
