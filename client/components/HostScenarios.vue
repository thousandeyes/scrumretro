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
  <div class="scenarios-container"><component :is="scenarioComponent" /></div>
</template>

<script lang="ts">
import Vue, { Component } from "vue";
import { mapGetters } from "vuex";
import { Scenario } from "../models/Room";
import BoardScenario from "./scenarios/BoardScenario.vue";
import PoolsScenario from "./scenarios/PoolsScenario.vue";
import SyncNotesScenario from "./scenarios/SyncNotesScenario.vue";

const scenarioComponents: Record<Scenario, Component> = {
  [Scenario.BOARD]: BoardScenario,
  [Scenario.POOLS]: PoolsScenario,
  [Scenario.CONFUENCE]: SyncNotesScenario
};

export default Vue.extend({
  computed: {
    ...mapGetters({
      room: "room/getHostRoom"
    }),
    scenarioComponent() {
      return scenarioComponents[this.room.scenario];
    }
  }
});
</script>
