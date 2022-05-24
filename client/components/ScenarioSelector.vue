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
