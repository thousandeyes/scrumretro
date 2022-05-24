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
