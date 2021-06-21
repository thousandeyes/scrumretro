<template>
  <div class="view-columns">
    <Column v-for="column in columns" :key="column.columnId" :column="column" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Column from '../models/Column';
import ColumnComponent from '../components/Column.vue';

export default Vue.extend({
  components: { Column: ColumnComponent, },
  props: {
    columns: { type: Array as PropType<Column[]> }
  },
});
</script>

<style scoped>
.view-columns {
  display: flex;
  justify-content: center;
}
</style>
