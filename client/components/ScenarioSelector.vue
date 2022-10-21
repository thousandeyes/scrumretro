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
