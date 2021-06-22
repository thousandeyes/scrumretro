<template>
  <div class="view-columns">
    <Column
      v-for="column in columns"
      :key="column.columnId"
      :column="column"
      :adminMode="adminMode"
      :onPostSubmit="onPostSubmit"
      :onColumnOpened="onColumnOpened"
      :onColumnRenamed="onColumnRenamed"
    />
    <h3 v-if="noColumns" class="no-columns">
      Host has not enabled columns for submissions
    </h3>
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
    onPostSubmit: {
      type: Function as PropType<(columnId: string, content: string) => void>,
      default: () => {}
    },
    onColumnOpened: {
      type: Function as PropType<(columnId: string, isOpen: boolean) => void>,
      default: () => {}
    },
        onColumnRenamed: {
      type: Function as PropType<(columnId: string, columnName: string) => void>,
      default: () => {}
    }
  },
  computed: {
    noColumns() {
      return this.columns.length === 0;
    }
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

.no-columns {
  text-align: center;
}
</style>
