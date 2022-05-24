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
  <div class="top-bar">
    <span class="room-details">
      <template v-if="adminMode">
        <ScenarioSelector :value="room.scenario" :onChange="scenarioSet" />
      </template>
    </span>

    <span class="room-details">
      <template v-if="room.roomName">
        <span class="label">ROOM:</span> {{ room.roomName || "-" }}
      </template>
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
