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
  <form @submit.prevent="post" novalidate>
    <textarea
      placeholder="What's on your mind?"
      @input="valueChanged"
      :value="value"
    />
    <div class="buttons">
      <div class="errors">
        <small> {{ error }} </small>
      </div>
      <button type="submit">Post</button>
    </div>
  </form>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  created() {
    window.addEventListener("keydown", this.controlEnterListener);
  },
  // make sure you remove the listener when the component is no longer visible
  destroyed() {
    window.removeEventListener("keydown", this.controlEnterListener);
  },
  props: {
    onPost: {
      type: Function as PropType<(value: string) => void>,
      default: () => {}
    }
  },
  data(): { value: string | null; error: string | null } {
    return { value: null, error: null };
  },
  methods: {
    post() {
      if (this.value == null) {
        this.error = "Please type something";
        return;
      }

      this.onPost(this.value);
      this.value = null;
    },
    valueChanged({ target }: { target: HTMLTextAreaElement }) {
      this.value = target.value;
      this.error = null;
    },
    controlEnterListener(event: KeyboardEvent) {
      if (event.key === "Enter" && event.ctrlKey) {
        this.post()
      }
    }
  }
});
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  height: 100%;
}

textarea {
  resize: none;
  height: 100%;
}

.buttons {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
}

.errors {
  color: red;
}
</style>
