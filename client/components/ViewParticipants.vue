<template>
  <div class="view-participants" v-if="room.participants.length > 0">
    <div class="participant-badges-container">
      <ParticipantBadge
        v-for="participant in room.participants"
        :key="participant.percistantId"
        :participant="participant"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Room from "../models/Room";
import ParticipantBadge from "./ParticipantBadge.vue";

export default Vue.extend({
  components: { ParticipantBadge },
  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    }
  }
});
</script>

<style scoped>
.view-participants {
  max-width: 40px;
  margin-top: 20px;
}
.participant-badges-container {
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}
.participant-badge {
  margin: 5px;
  flex-shrink: 0;
}
</style>
