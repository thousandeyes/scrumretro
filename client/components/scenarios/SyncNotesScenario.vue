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
