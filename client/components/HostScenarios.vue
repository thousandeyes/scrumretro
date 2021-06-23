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
