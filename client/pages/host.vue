<template>
  <div>
    <RoomDetails :persistentIdKey="persistentIdKey" :room="room" />
    <ViewColumns
      :columns="room.columns"
      :adminMode="true"
      :onNewColumn="onNewColumn"
    />
    <SyncNotes
      :persistentIdKey="persistentIdKey"
      :onSync="onSyncNotes"
      :state="syncNotesState"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations, mapGetters } from "vuex";
import { MessageType, ServerMessage } from "../../messages";
import ViewColumns from "../components/ViewColumns.vue";
import RoomDetails from "../components/RoomDetails.vue";
import SyncNotes from "../components/SyncNotes.vue";
import { ROOM_MODE } from "../models/Room";

const PERSISTENT_ID_KEY = "persistentId";

export default Vue.extend({
  components: { RoomDetails, ViewColumns, SyncNotes },
  data(): State {
    return {
      persistentIdKey: PERSISTENT_ID_KEY,
      syncNotesState: {
        message: "",
        confluencePageUrl: ""
      }
    };
  },
  mounted() {
    this.initRoomState(this.$config.stage, ROOM_MODE.HOST);
    this.socket = new WebSocket(this.$config.websocketUrl);
    this.socket.onopen = () => this.socketOpened();
    this.socket.onmessage = event => this.onSocketMessage(event);
  },
  beforeDestroy() {
    this.socket.close();
  },
  computed: {
    ...mapGetters({
      room: "room/getRoom"
    })
  },
  methods: {
    ...mapMutations({
      initRoomState: "room/init",
      connected: "room/connected"
    }),
    socketOpened() {
      this.connected();
      this.socket.send(
        JSON.stringify({
          type: MessageType.SCRUM_MASTER_LOGIN,
          persistentId: this.room.persistentId
        })
      );
    },
    onSocketMessage(event: MessageEvent) {
      const message: ServerMessage = JSON.parse(event.data);
      switch (message.type) {
        case MessageType.PERSISTENT_ID_GENERATED:
        case MessageType.ROOM_JOINED:
        case MessageType.COLUMNS_UPDATED:
          this.$store.commit(`room/${message.type}`, message);
          break;
        case MessageType.CONFLUENCE_NOTES_SYNCED:
          const { response, confluencePageUrl } = message;
          Object.assign(this.syncNotesState, { response, confluencePageUrl });
          break;
        default:
          console.warn("Unknown message received", { ...message });
          break;
      }
    },
    onNewColumn() {
      this.socket.send(
        JSON.stringify({
          type: MessageType.SCRUM_MASTER_ADD_COLUMN,
          persistentId: this.room.persistentId
        })
      );
    },
    onSyncNotes() {
      this.socket.send(
        JSON.stringify({
          type: MessageType.CONFLUENCE_NOTES_SYNC,
          persistentId: this.room.persistentId
        })
      );

      // TODO: Update UI
    }
  }
});

interface State {
  persistentIdKey: string;
  syncNotesState: {
    message: string;
    confluencePageUrl?: string;
  };
}
</script>
