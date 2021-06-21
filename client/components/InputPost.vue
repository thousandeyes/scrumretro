<template>
  <form @submit.prevent="post" novalidate>
    <textarea placeholder="What's on your mind?" @input="valueChanged" :value="value" />
    <div class="buttons">
      <div class="errors">
        <small> {{error}} </small>
      </div>
      <button type="submit"> Post </button>
    </div>
  </form>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';


export default Vue.extend({
  props: {
    onPost: {
      type: Function as PropType<(value: string) => void>,
      default: () => {}
    }
  },
  data(): { value: string | null, error: string | null } {
    return { value: null, error: null };
  },
  methods: {
    post() {
      if (this.value == null) {
        this.error = 'Please type something';
        return;
      }

      this.onPost(this.value);
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

</style>
