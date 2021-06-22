<template>
  <div class="host-page">
    <RoomDetails :room="room" />
    <div class="main-container">
      <ViewParticipants :room="room" />
      <ViewColumns
        :columns="room.columns"
        :adminMode="true"
        :onNewColumn="onNewColumn"
        :onColumnOpened="onColumnOpened"
        :onColumnRenamed="onColumnRenamed"
        :onColumnDeleted="onColumnDeleted"
        :onPostDeleted="onPostDeleted"
      />
    </div>

    <AddAtlassianToken
      class="add-token"
      :onTokenAdd="onAddAtlassianToken"
      :tokenExists="tokenExists"
    />

    <SyncNotes
      class="sync-notes"
      :onSync="onSyncNotes"
      :state="syncNotesState"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations, mapGetters } from "vuex";
import { MessageType, ServerMessage } from "../../messages";
import ViewParticipants from "../components/ViewParticipants.vue";
import ViewColumns from "../components/ViewColumns.vue";
import RoomDetails from "../components/RoomDetails.vue";
import AddAtlassianToken from "../components/AddAtlassianToken.vue"
import SyncNotes from "../components/SyncNotes.vue";
import { ROOM_MODE } from "../models/Room";

ViewParticipants;

const PERSISTENT_ID_KEY = "persistentId";

export default Vue.extend({
  components: { RoomDetails, ViewColumns, AddAtlassianToken, SyncNotes, ViewParticipants },
  data(): State {
    return {
      persistentIdKey: PERSISTENT_ID_KEY,
      syncNotesState: {
        message: "",
        confluencePageUrl: ""
      },
      tokenExists : false
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
        case MessageType.PARTICIPANT_JOINED:
        case MessageType.POST_DELETED:
          this.$store.commit(`room/${message.type}`, message);
          break;
        case MessageType.ATLASSIAN_TOKEN_ADDED:
          this.tokenExists = message.result;
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
    },
    onAddAtlassianToken(username: string, token: string) {
      this.socket.send(
        JSON.stringify({
          type: MessageType.ATLASSIAN_TOKEN_ADD,
          persistentId: this.room.persistentId,
          username,
          token
        })
      );
    },
    onColumnRenamed(columnId: string, columnName: string) {
      this.socket.send(
        JSON.stringify({
          type: MessageType.CHANGE_COLUMN_NAME,
          roomName: this.room.roomName,
          columnId,
          columnName
        })
      );
    },
    onPostDeleted(postId: string) {
      this.socket.send(
        JSON.stringify({
          type: MessageType.DELETE_POST,
          roomName: this.room.roomName,
          postId
        })
      );
    }
  }
});

interface State {
  persistentIdKey: string;
  syncNotesState: {
    message: string;
    confluencePageUrl?: string;
  };
  tokenExists : boolean;
}
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

.view-columns {
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
</style>
