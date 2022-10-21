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
  <div class="sync-notes-scenario">
    <AddAtlassianToken
      class="add-token"
      :onTokenAdd="onAddAtlassianToken"
      :tokenExists="syncNotes.tokenExists"
    />

    <SyncNotes class="sync-notes" :onSync="onSyncNotes" :state="syncNotes" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import { MessageType } from "../../../messages";
import socketService from "../../lib/socketService";
import AddAtlassianToken from "../AddAtlassianToken.vue";
import SyncNotes from "../SyncNotes.vue";

export default Vue.extend({
  components: { SyncNotes, AddAtlassianToken },
  computed: {
    ...mapGetters({
      syncNotes: "syncNotes/getSyncNotes",
      room: "room/getHostRoom"
    })
  },
  methods: {
    onSyncNotes() {
      socketService.send({
        type: MessageType.CONFLUENCE_NOTES_SYNC,
        persistentId: this.room.persistentId
      });
    },
    onAddAtlassianToken(username: string, token: string) {
      socketService.send({
        type: MessageType.ATLASSIAN_TOKEN_ADD,
        persistentId: this.room.persistentId,
        username,
        token
      });
    }
  }
});
</script>

<style scoped>
.sync-notes-scenario {
  max-width: 500px;
  margin: 0 auto;
}
</style>
