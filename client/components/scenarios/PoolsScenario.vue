<template>
  <div class="pools-scenario"></div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

export default Vue.extend({
  computed: {
    ...mapGetters({
      room: "room/getHostRoom"
    })
  }
});
</script>
