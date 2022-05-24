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
  <div
    class="participant-badge"
    :class="sizeClass"
    :style="{ 'background-color': color }"
    :title="participant.participantName"
  >
    {{ letter }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Participant from "../models/Participant";

const colorsMap: Map<string, string> = new Map();

export default Vue.extend({
  props: {
    participant: {
      type: Object as PropType<Participant>,
      required: true
    },
    size: {
      type: String
    }
  },
  computed: {
    letter() {
      return this.participant.participantName.substring(0, 1);
    },
    color() {
      const { persistentId } = this.participant;
      if (!colorsMap.has(persistentId)) {
        colorsMap.set(persistentId, getRandomColor());
      }
      return colorsMap.get(persistentId);
    },
    sizeClass() {
      if (this.size === "sm") {
        return "badge-sm";
      }
      return "badge-md";
    }
  }
});

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
</script>

<style scoped>
.participant-badge {
  color: white;
  text-align: center;
  cursor: pointer;
}

.badge-sm {
  border-radius: calc(10px / 2);
  width: 10px;
  height: 10px;
  line-height: 10px;
  font-size: 10px;
}

.badge-md {
  border-radius: calc(20px / 2);
  width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 20px;
}
</style>
