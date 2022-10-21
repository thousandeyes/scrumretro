<!--
 Copyright 2022 Cisco Systems, Inc. and its affiliates
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
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
