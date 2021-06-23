<template>
  <div class="top-bar">
    <span class="room-details">
      <template v-if="adminMode">
        <ScenarioSelector :value="room.scenario" :onChange="scenarioSet" />
      </template>
    </span>

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
import ScenarioSelector from "./ScenarioSelector.vue";

export default Vue.extend({
  components: { ScenarioSelector },
  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },
    adminMode: { type: Boolean, default: false }
  },
  methods: {
    ...mapMutations({
      resetPersistentId: "room/resetPersistentId",
      scenarioSet: "room/scenarioSet"
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
