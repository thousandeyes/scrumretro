<template>
  <div class="play">
    <ViewColumns :columns="columns" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ViewColumns from '../components/ViewColumns.vue';

export default Vue.extend({
  components: { ViewColumns },
  data: () => ({
    columns: [
      {
        columnId: 'ID 1',
        columnName: 'Column 1',
        isOpen: true,
        posts: [],
      },
      {
        columnId: 'ID 2',
        columnName: 'Column 2',
        isOpen: true,
        posts: [],
      },
    ],
  })
});
</script>
