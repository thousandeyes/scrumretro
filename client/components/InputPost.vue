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
