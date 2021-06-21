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
import { MessageType, ServerMessage } from "../../messages";
import ViewColumns from "../components/ViewColumns.vue";
import RoomDetails from "../components/RoomDetails.vue";
import SyncNotes from "../components/SyncNotes.vue";
import Room from "../models/Room";

const PERSISTENT_ID_KEY = "persistentId";

export default Vue.extend({
  components: { RoomDetails, ViewColumns, SyncNotes },
  data(): State {
    return {
      persistentIdKey: PERSISTENT_ID_KEY,
      room: {
        connected: false,
        persistentId: undefined,
        roomName: undefined,
        columns: [],
        participants: [],
      },
      syncNotesState: {
        message: "",
        confluencePageUrl: "",
      },
    };
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
        case MessageType.ROOM_JOINED: {
          const { roomName, columns } = message;
          Object.assign(this.room, { roomName, columns });
          break;
        }
        case MessageType.COLUMNS_UPDATED: {
          const { columns } = message;
          Object.assign(this.room, { columns });
          break;
        }
        case MessageType.CONFLUENCE_NOTES_SYNCED:
          const { response, confluencePageUrl } = message;
          Object.assign(this.syncNotesState, { response, confluencePageUrl });
          break;
        default:
          console.warn("Unknown message received", { ...message });
          break;
      }
    },
    savePersistentId(persistentId: string) {
      const localStorageKey = `${this.$config.stage}/${PERSISTENT_ID_KEY}`;
      window.localStorage[localStorageKey] = persistentId;
      this.room.persistentId = persistentId;
    },
    onNewColumn() {
      this.socket.send(
        JSON.stringify({
          type: MessageType.SCRUM_MASTER_ADD_COLUMN,
          persistentId: this.room.persistentId,
        })
      );
    },
    onSyncNotes() {
      this.socket.send(
        JSON.stringify({
          type: MessageType.CONFLUENCE_NOTES_SYNC,
          persistentId: this.room.persistentId,
        })
      );

      // TODO: Update UI
    },
  },
});

interface State {
  persistentIdKey: string;
  room: Room;
  syncNotesState: {
    message: string;
    confluencePageUrl?: string;
  };
}
</script>

<style scoped>
</style>
