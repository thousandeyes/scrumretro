<template>
  <select :value="value" @change="onRoomScenarioChanged">
    <option
      v-for="scenario in scenarios"
      :key="scenario.id"
      :value="scenario.id"
    >
      {{ scenario.display }}
    </option>
  </select>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { Scenario } from "../models/Room";

const scenarioOptions: {
  [P in Scenario]: { id: P; display: string; hidden?: true };
} = {
  [Scenario.BOARD]: {
    id: Scenario.BOARD,
    display: "Board"
  },
  [Scenario.POOLS]: {
    id: Scenario.POOLS,
    display: "Pools",
    hidden: true
  },
  [Scenario.CONFUENCE]: {
    id: Scenario.CONFUENCE,
    display: "Sync Notes"
  }
};

export default Vue.extend({
  props: {
    value: {
      type: String as PropType<Scenario>,
      required: true
    },
    onChange: {
      type: Function as PropType<(value: Scenario) => void>,
      default: () => {}
    }
  },
  data() {
    return {
      scenarios: Object.values(scenarioOptions).filter(({ hidden }) => !hidden)
    };
  },
  methods: {
    onRoomScenarioChanged({ target }: { target: HTMLSelectElement }) {
      this.onChange(target.value as Scenario);
    }
  }
});
</script>
