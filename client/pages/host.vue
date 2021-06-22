<template>
  <div>
    <RoomDetails :persistentIdKey="persistentIdKey" :room="room" />
    <ViewColumns
      :columns="room.columns"
      :adminMode="true"
      :onNewColumn="onNewColumn"
      :onColumnOpened="onColumnOpened"
      :onColumnRenamed="onColumnRenamed"
      :onColumnDeleted="onColumnDeleted"
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
    this.initRoomState({ stage: this.$config.stage, roomMode: ROOM_MODE.HOST });
    this.socket = new WebSocket(this.$config.websocketUrl);
    this.socket.onopen = () => this.socketOpened();
    this.socket.onmessage = event => this.onSocketMessage(event);
  },
  beforeDestroy() {
    this.socket.close();
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
        case MessageType.POST_ADDED:
        case MessageType.COLUMN_OPEN_STATE_CHANGED:
        case MessageType.COLUMN_NAME_CHANGED:
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
    onColumnDeleted(columnId: string) {
      this.socket.send(
        JSON.stringify({
          type: MessageType.DELETE_COLUMN,
          roomName: this.room.roomName,
          columnId
        })
      );
    },
    onColumnOpened(columnId: string, isOpen: boolean) {
      this.socket.send(
        JSON.stringify({
          type: MessageType.CHANGE_COLUMN_OPEN_STATE,
          persistentId: this.room.persistentId,
          roomName: this.room.roomName,
          columnId,
          isOpen
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
    },
    onColumnRenamed(columnId: string, columnName: string) {
      this.socket.send(
        JSON.stringify({
          type: MessageType.CHANGE_COLUMN_NAME,
          roomName: this.room.roomName,
          columnId,
          columnName,
        })
      );
    },
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
