<template>
  <div class="player-view">
    <RoomDetails :room="room" />
    <div v-if="alertMsg" class="alert">{{ alertMsg }}</div>
    <div v-if="room.roomName != null" class="play">
      <ViewColumns
        :columns="room.columns"
        :onPostSubmit="onPostSubmit"
        :adminMode="false"
        />
    </div>
    <JoinRoom
      v-else
      :roomNameParam="roomNameParam"
      :onJoinRoomClick="onJoinRoomClick"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations, mapGetters } from "vuex";
import ViewColumns from "../../components/ViewColumns.vue";
import JoinRoom from "../../components/JoinRoom.vue";
import RoomDetails from "../../components/RoomDetails.vue";
import {
  AddPostMessage,
  MessageType,
  ParticipantLoginMessage,
  RoomJoinedMessage,
  ServerMessage
} from "../../../messages";
import { ROOM_MODE } from "../../models/Room";

export default Vue.extend({
  components: { RoomDetails, ViewColumns, JoinRoom },
  data(): State {
    return {
      alertMsg: undefined
    };
  },
  mounted() {
    this.initRoomState({
      stage: this.$config.stage,
      roomMode: ROOM_MODE.PLAYER
    });
    this.socket = new WebSocket(this.$config.websocketUrl);
    this.socket.onopen = () => this.socketOpened();
    this.socket.onmessage = event => this.onSocketMessage(event);
  },
  beforeDestroy() {
    this.socket.close();
  },
  computed: {
    ...mapGetters({
      room: "room/getPlayerRoom"
    }),
    roomNameParam() {
      return this.$route.params.roomName;
    }
  },
  methods: {
    ...mapMutations({
      initRoomState: "room/init",
      connected: "room/connected"
    }),
    socketOpened() {
      this.connected();
    },
    onSocketMessage(event: MessageEvent) {
      const message: ServerMessage = JSON.parse(event.data);
      if (message.type == null) {
        this.alertMsg = "Whoops! Something went wrong, please try again later.";
        return;
      }
      switch (message.type) {
        case MessageType.PERSISTENT_ID_GENERATED:
        case MessageType.ROOM_JOINED:
        case MessageType.COLUMNS_UPDATED:
        case MessageType.POST_ADDED:
        case MessageType.COLUMN_OPEN_STATE_CHANGED:
        case MessageType.COLUMN_NAME_CHANGED:
          this.$store.commit(`room/${message.type}`, message);
          break;
        case MessageType.ACTION_FAILED:
          this.alertMsg = message.details;
          break;
      }
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
    },
    onPostSubmit(columnId: string, content: string): void {
      const message: AddPostMessage = {
        type: MessageType.ADD_POST,
        participantId: this.room.persistentId,
        roomName: this.room.roomName,
        columnId,
        content
      };
      this.socket.send(JSON.stringify(message));
    }
  }
});

interface State {
  alertMsg?: string;
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
