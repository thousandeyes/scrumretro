<template>
  <div class="sync-notes">
    <h3>Sync Notes to confluence</h3>
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
  </div>
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
.sync-notes {
  padding: 20px;
}

form {
  display: flex;
  flex-direction: column;
}

textarea {
  resize: none;
  height: 100px;
  border: 1px solid #ddd;
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
