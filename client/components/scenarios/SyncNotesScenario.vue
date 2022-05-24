<!--
 Copyright (C) 2022 Cisco Systems, Inc. and its affiliates
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
