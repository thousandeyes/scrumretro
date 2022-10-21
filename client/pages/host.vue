<!--
 Copyright 2022 Cisco Systems, Inc. and its affiliates
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

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
