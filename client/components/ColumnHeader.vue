<template>
  <div class="column-header">
    <h2 v-if="!edit" :title="column.columnName">{{ column.columnName }}</h2>
    <form v-else @submit.prevent="onEditToggled" novalidate>
      <input v-model="columnNameEditing" />
    </form>
    <span v-if="adminMode" class="column-admin-buttons">
      <button @click="onEditToggled">✏️</button>
      <button @click="onOpenToggled">
        <template v-if="column.isOpen">
          🔇
        </template>
        <template v-else>
          🎤
        </template>
      </button>
    </span>
  </div>
</template>

<script lang="ts">
import { debounce } from "lodash";
import Vue, { PropType } from "vue";
import Column from "../models/Column";

export default Vue.extend({
  props: {
    column: { type: Object as PropType<Column>, required: true },
    adminMode: { type: Boolean, default: true },
    onColumnOpened: {
      type: Function as PropType<(columnId: string, isOpen: boolean) => void>,
      default: () => {}
    },
    onColumnRenamed: {
      type: Function as PropType<(columnId: string, columnName: string) => void>,
      default: () => {}
    }
  },
  data(): { edit: boolean, columnNameEditing: string } {
    return {
      edit: false,
      columnNameEditing: this.column.columnName,
    };
  },
  watch: {
    column(newColumn: Column) {
      this.columnNameEditing = newColumn.columnName;
    },
    columnNameEditing(columnName: string) {
      this.debouncedOnColumnRenamed(this.column.columnId, this.columnNameEditing);
    },
  },
  mounted() {
    this.debouncedOnColumnRenamed = debounce(this.onColumnRenamed, 250);
  },
  methods: {
    onEditToggled() {
      this.edit = !this.edit;
    },
    onOpenToggled() {
      this.onColumnOpened(this.column.columnId, !this.column.isOpen);
    },
  }
});
</script>

<style scoped>
.column-header h2 {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 3px 4px;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  font-weight: bold;
}

input {
  padding: 1px 2px;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  font-weight: bold;
}

button {
  cursor: pointer;
  border: none;
  background: transparent;
}

.column-header {
  display: flex;
  align-items: baseline;
}
</style>
