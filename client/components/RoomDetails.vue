<template>
  <div class="top-bar">
    <span class="room-details"></span>
    <span class="room-details">
      <span class="label">ROOM:</span> {{ room.roomName || "-" }}
    </span>

    <span class="room-details">
      <template v-if="room.connected">
        📶 Connected
      </template>
      <template v-else>
        🟥 NOT Connected
      </template>
    </span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { mapMutations } from "vuex";
import Room from "../models/Room";

export default Vue.extend({
  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    }
  },

  methods: {
    ...mapMutations({
      resetPersistentId: "room/resetPersistentId"
    })
  }
});
</script>

<style scoped>
.top-bar {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.room-details .label {
  font-weight: bold;
  color: grey;
}

button {
  cursor: pointer;
  border: none;
  background: transparent;
}
</style>
