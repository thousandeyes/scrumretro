<template>
  <div class="column-header">
    <h2 v-if="!edit" :title="column.columnName">{{ column.columnName }}</h2>
    <form v-else @submit.prevent="onEditToggled" novalidate>
      <input @input="onNameChanged" :value="column.columnName" />
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
import Vue, { PropType } from "vue";
import Column from "../models/Column";

export default Vue.extend({
  props: {
    column: { type: Object as PropType<Column>, required: true },
    adminMode: { type: Boolean, default: true }
  },
  data(): { edit: boolean } {
    return { edit: false };
  },
  methods: {
    onEditToggled() {
      this.edit = !this.edit;
    },
    onOpenToggled() {
      this.column.isOpen = !this.column.isOpen;
      // TODO: update name on the server
    },
    onNameChanged({ target }: { target: HTMLInputElement }) {
      this.column.columnName = target.value;
      // TODO: update name on the server
    }
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
