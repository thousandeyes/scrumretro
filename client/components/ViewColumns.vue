<template>
  <div class="view-columns">
    <Column
      v-for="column in columns"
      :key="column.columnId"
      :column="column"
      :adminMode="adminMode"
      :onPostSubmit="onPostSubmit"
    />
    <div v-if="adminMode">
      <div class="manage-columns-btns">
        <button @click="onNewColumn">➕</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Column from "../models/Column";
import ColumnComponent from "../components/Column.vue";

export default Vue.extend({
  components: { Column: ColumnComponent },
  props: {
    columns: { type: Array as PropType<Column[]> },
    adminMode: { type: Boolean, default: false },
    onNewColumn: { type: Function as PropType<() => void>, default: () => {} },
    onPostSubmit: { type: Function as PropType<(columnId: string, content: string) => void>, required: true },
  }
});
</script>

<style scoped>
.view-columns {
  overflow: auto;
  height: calc(100vh - 50px);
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.manage-columns-btns {
  padding: 10px;
}

button {
  cursor: pointer;
  border: none;
  background: transparent;
  margin-block-start: 0.83em;
  font-size: 1.5em;
}
</style>
