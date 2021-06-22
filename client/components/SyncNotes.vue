<template>
  <form @submit.prevent="sync" novalidate>
    <textarea
      placeholder="Additional Comment"
      @input="valueChanged"
      :value="value"
    />
    <div class="buttons">
      <div class="confluence-page-url">
        {{ state.confluencePageUrl }}
      </div>
      <div class="message">
        <small> {{ state.message }} </small>
      </div>
      <div class="errors">
        <small> {{ error }} </small>
      </div>
      <button type="submit">Sync Notes</button>
    </div>
  </form>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import SyncNotesState from "../models/SyncNotesState";

export default Vue.extend({
  props: {
    onSync: {
      type: Function as PropType<(value: string) => void>,
      default: () => {}
    },
    state: {
      type: Object as PropType<SyncNotesState>,
      required: true
    }
  },
  data(): { value: string | null; error: string | null } {
    return { value: null, error: null };
  },
  methods: {
    sync() {
      this.onSync(this.value);
      this.value = null;
    },
    valueChanged({ target }: { target: HTMLTextAreaElement }) {
      this.value = target.value;
      this.error = null;
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

.message {
  color: blue;
}

.confluence-page-url {
  color: darkslategray;
}
</style>
