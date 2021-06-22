<template>
  <div v-if="!tokenExists">
    <form @submit.prevent="addToken" novalidate>
      <fieldset>
      <!-- <label for="usernameInput">Username</label> -->
      <input
        v-model="username"
        placeholder="Username"
        type="text"
        name="usernameInput"
        id="usernameInput"
      />
      </fieldset>

      <fieldset>
      <!-- <label for="tokenInput">Token</label> -->
      <input
        v-model="token"
        placeholder="Token"
        type="text"
        name="tokenInput"
        id="tokenInput"
      />
      </fieldset>

      <div class="buttons">
        <button type="submit">Add Token</button>
      </div>
    </form>
  </div>
  <div v-else class="badge-sm">
    Token Added ✅
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  props: {
    onTokenAdd: {
      type: Function as PropType<(username: string, token: string) => void>,
      default: () => {}
    },
    tokenExists: {
      type: Boolean,
      required: true
    }
  },
  data(): { username: string | null; token: string | null } {
    return { username: null, token: null };
  },
  methods: {
    addToken() {
      this.onTokenAdd(this.username, this.token);
      this.username = null;
      this.token = null;
    }
  }
});
</script>

<style scoped>
form {
  display: flex;
  height: 100%;
}

.buttons {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
}

</style>
