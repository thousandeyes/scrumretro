<template>
  <div class="player-view">
    <RoomDetails :room="room" />
    <JoinRoom
      v-if="joinRoomForm"
      :roomNameParam="roomNameParam"
      :onJoinRoomClick="onJoinRoomClick"
    />
    <div v-else class="play">
      <template v-if="room.joined">
        <ViewColumns
          :columns="room.columns"
          :onPostSubmit="onPostSubmit"
          :onPostDeleted="onPostDeleted"
          :adminMode="false"
        />
      </template>
      <h3 v-else>Joining room...</h3>
    </div>
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
import socketService from "../../lib/socketService";

const ERROR_OPTIONS = { duration: 10000 };

export default Vue.extend({
  components: { RoomDetails, ViewColumns, JoinRoom },
  data(): { joinRoomForm: boolean } {
    return { joinRoomForm: true };
  },
  mounted() {
    this.initRoomState({
      stage: this.$config.stage,
      roomMode: ROOM_MODE.PLAYER
    });
    socketService.connect(
      this.$config.websocketUrl,
      () => this.socketOpened(),
      message => this.onSocketMessage(message)
    );
  },
  beforeDestroy() {
    socketService.close();
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
    onSocketMessage(message: ServerMessage) {
      if (message.type == null) {
        this.$toasted.error(
          "Whoops! Something went wrong, please try again later.",
          ERROR_OPTIONS
        );
        return;
      }
      switch (message.type) {
        case MessageType.PERSISTENT_ID_GENERATED:
        case MessageType.ROOM_JOINED:
        case MessageType.COLUMNS_UPDATED:
        case MessageType.POST_ADDED:
        case MessageType.COLUMN_OPEN_STATE_CHANGED:
        case MessageType.COLUMN_NAME_CHANGED:
        case MessageType.POST_DELETED:
          this.$store.commit(`room/${message.type}`, message);
          break;
        case MessageType.SERVER_PONG:
          break;
        case MessageType.ACTION_FAILED:
          this.$toasted.error(message.details, ERROR_OPTIONS);
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
      socketService.send(message);
      this.joinRoomForm = false;
    },
    onPostSubmit(columnId: string, content: string): void {
      const message: AddPostMessage = {
        type: MessageType.ADD_POST,
        participantId: this.room.persistentId,
        roomName: this.room.roomName,
        columnId,
        content
      };
      socketService.send(message);
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

<style scoped>
.room-login-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

h3 {
  text-align: center;
}
</style>
