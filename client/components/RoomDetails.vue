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
