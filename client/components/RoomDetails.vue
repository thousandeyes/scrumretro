<template>
  <div class="top-bar">
    <span class="room-label">
      <strong>Connected:</strong> {{ room.connected || '-' }}
    </span>
    <span class="room-label">
      <strong>Persistent ID:</strong> {{ room.persistentId || '-' }}
    </span>
    <span class="room-label">
      <strong>Room name:</strong> {{ room.roomName || '-' }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Room from '../models/Room';

export default Vue.extend({
  props: {
    room: {
      type: Object as PropType<Room>,
      required: true,
    },
  },
});

</script>

<style scoped>

.top-bar {
  height: 50px;
  padding: 5px;
  border-bottom: 1px solid grey;
}

</style>
