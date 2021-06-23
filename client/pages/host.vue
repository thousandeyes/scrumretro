<template>
  <div class="host-page">
    <RoomDetails :room="room" :adminMode="true" />
    <div class="main-container" v-if="room.joined">
      <ViewParticipants :room="room" />
      <HostScenarios />
    </div>

    <h3 v-else>Joining room...</h3>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations, mapGetters } from "vuex";
import { MessageType, ServerMessage } from "../../messages";
import ViewParticipants from "../components/ViewParticipants.vue";
import RoomDetails from "../components/RoomDetails.vue";
import { ROOM_MODE } from "../models/Room";
import HostScenarios from "../components/HostScenarios.vue";
import socketService from "../lib/socketService";

const ERROR_OPTIONS = { duration: 10000 };

export default Vue.extend({
  components: {
    RoomDetails,
    ViewParticipants,
    HostScenarios
  },
  mounted() {
    this.initRoomState({ stage: this.$config.stage, roomMode: ROOM_MODE.HOST });
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
      room: "room/getHostRoom"
    })
  },
  methods: {
    ...mapMutations({
      initRoomState: "room/init",
      connected: "room/connected"
    }),
    socketOpened() {
      this.connected();
      socketService.send({
        type: MessageType.SCRUM_MASTER_LOGIN,
        persistentId: this.room.persistentId
      });
    },
    onSocketMessage(message: ServerMessage) {
      switch (message.type) {
        case MessageType.PERSISTENT_ID_GENERATED:
        case MessageType.ROOM_JOINED:
        case MessageType.COLUMNS_UPDATED:
        case MessageType.POST_ADDED:
        case MessageType.COLUMN_OPEN_STATE_CHANGED:
        case MessageType.COLUMN_NAME_CHANGED:
        case MessageType.PARTICIPANT_JOINED:
        case MessageType.POST_DELETED:
          this.$store.commit(`room/${message.type}`, message);
          break;
        case MessageType.CONFLUENCE_NOTES_SYNCED:
        case MessageType.ATLASSIAN_TOKEN_ADDED:
          this.$store.commit(`syncNotes/${message.type}`, message);
          break;
        case MessageType.ACTION_FAILED:
          this.$toasted.error(message.details, ERROR_OPTIONS);
          break;
        case MessageType.SERVER_PONG:
          break;
        default:
          console.warn("Unknown message received", { ...message });
          break;
      }
    }
  }
});
</script>

<style scoped>
.host-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  display: flex;
  flex: 1 0;
}

.scenarios-container {
  flex-basis: 100%;
}

.top-bar {
  flex-shrink: 0;
}

.sync-notes {
  height: auto;
  flex-basis: 100px;
  padding: 5px 20px;
}
h3 {
  text-align: center;
}
</style>
