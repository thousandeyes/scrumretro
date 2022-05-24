<!--
 Copyright (C) 2022 Cisco Systems, Inc. and its affiliates
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <div class="column-header">
    <h2 v-if="!edit" :title="column.columnName">{{ column.columnName }}</h2>
    <form v-else @submit.prevent="onEditToggled" novalidate>
      <input v-model="columnNameEditing" class="column-name-input" />
    </form>
    <span class="column-admin-buttons" v-if="adminMode">
      <button class="rename-button" @click="onEditToggled">
        ✏️
      </button>
      <button @click="onOpenToggled">
        <template v-if="column.isOpen"> 🔇 </template>
        <template v-else> 🎤 </template>
      </button>
      <button @click="deleteColumn">❌</button>
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
    adminMode: { type: Boolean, default: false },
    onColumnOpened: {
      type: Function as PropType<(columnId: string, isOpen: boolean) => void>,
      default: () => {}
    },
    onColumnRenamed: {
      type: Function as PropType<
        (columnId: string, columnName: string) => void
      >,
      default: () => {}
    },
    onColumnDeleted: {
      type: Function as PropType<(columnId: string) => void>,
      default: () => {}
    }
  },
  data(): { edit: boolean; columnNameEditing: string; maskPosts: boolean } {
    return {
      edit: false,
      columnNameEditing: this.column.columnName,
      maskPosts: false
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
    }
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
    }
  }
});
</script>

<style scoped>
.column-header {
  display: flex;
  justify-content: space-between;
}
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
  width: 100%;
}

button {
  cursor: pointer;
  border: none;
  background: transparent;
}

.column-admin-buttons {
  display: flex;
  align-items: center;
}

.mask-posts-label {
  margin-right: auto;
}
</style>
