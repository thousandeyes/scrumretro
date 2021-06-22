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
