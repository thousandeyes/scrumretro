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
  <div class="view-columns">
    <Column
      v-for="column in columns"
      :key="column.columnId"
      :column="column"
      :adminMode="adminMode"
      :onPostSubmit="onPostSubmit"
      :onColumnOpened="onColumnOpened"
      :onColumnRenamed="onColumnRenamed"
      :onColumnDeleted="onColumnDeleted"
      :onPostDeleted="onPostDeleted"
    />
    <h3 v-if="!adminMode && noColumns" class="no-columns">
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
      default: () => {},
    },
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
    onPostDeleted: {
      type: Function as PropType<(postId: string) => void>,
      default: () => {},
    },
  },
  computed: {
    noColumns() {
      return this.columns.length === 0;
    },
  },
});
</script>

<style scoped>
.view-columns {
  overflow: auto;
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
