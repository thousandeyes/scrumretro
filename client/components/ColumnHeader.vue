<template>
  <div class="column-header">
    <div class="heading-form">
    <h2 v-if="!edit" :title="column.columnName">{{ column.columnName }}</h2>
    <form v-else @submit.prevent="onEditToggled" novalidate>
      <input v-model="columnNameEditing" class="column-name-input" />
    </form>
    <button v-if="adminMode" class="rename-button" @click="onEditToggled">✏️</button>
    </div>
    <div v-if="adminMode" class="column-admin-buttons">
      <label class="mask-posts-label"><input type="checkbox" v-model="maskPosts" /> Mask posts</label>
      <button @click="onOpenToggled">
        <template v-if="column.isOpen"> 🔇 </template>
        <template v-else> 🎤 </template>
      </button>
      <button @click="deleteColumn">❌</button>
    </div>
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
      default: () => {},
    },
    onColumnRenamed: {
      type: Function as PropType<
        (columnId: string, columnName: string) => void
      >,
      default: () => {},
    },
    onColumnDeleted: {
      type: Function as PropType<(columnId: string) => void>,
      default: () => {},
    },
    onMaskPostsChanged: {
      type: Function as PropType<(maskPosts: boolean) => void>,
      default: () => {},
    },
  },
  data(): { edit: boolean; columnNameEditing: string; maskPosts: boolean } {
    return {
      edit: false,
      columnNameEditing: this.column.columnName,
      maskPosts: false,
    };
  },
  watch: {
    column(newColumn: Column) {
      this.columnNameEditing = newColumn.columnName;
    },
    columnNameEditing(columnName: string) {
      this.debouncedOnColumnRenamed(
        this.column.columnId,
        this.columnNameEditing
      );
    },
    maskPosts(maskPosts: boolean) {
      this.onMaskPostsChanged(maskPosts);
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
    deleteColumn() {
      this.onColumnDeleted(this.column.columnId);
    },
  },
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
  line-height: 1;
}

.column-name-input {
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

.column-admin-buttons {
  display: flex;
}

.mask-posts-label {
  margin-right: auto;
}

.heading-form {
  display: flex;
  align-items: baseline;
}

.rename-button {
  padding: 10px 5px;
  position: relative;
  top: -5px;
}
</style>
