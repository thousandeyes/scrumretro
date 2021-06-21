<template>
  <div class="play">
    <ViewColumns :columns="columns" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Column from '../models/Column';
import ViewColumns from '../components/ViewColumns.vue';

export default Vue.extend({
  components: { ViewColumns },
  data(): { columns: Column[] } {
    const columns: Column[] = [
      {
        columnId: 'ID 1',
        columnName: 'Column 1',
        isOpen: false,
        posts: [],
      },
      {
        columnId: 'ID 2',
        columnName: 'Column 2',
        isOpen: false,
        posts: [],
      },
      {
        columnId: 'ID 3',
        columnName: 'Column 3',
        isOpen: false,
        posts: [],
      }
    ];
    return { columns };
  }
});
</script>
