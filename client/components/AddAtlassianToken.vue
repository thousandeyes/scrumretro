<template>
  <div class="add-atlassian-token">
    <template v-if="!tokenExists">
      <h3>Add Atlassian token</h3>
      <p>
        <a href="https://id.atlassian.com/manage-profile/security/api-tokens">
          Generate an Atlassian token
        </a>
      </p>
      <form @submit.prevent="addToken" novalidate>
        <fieldset>
          <label for="usernameInput">Username</label>
          <input
            v-model="username"
            placeholder="E.g., username@thousandeyes.com"
            type="text"
            name="usernameInput"
            id="usernameInput"
          />
        </fieldset>

        <fieldset>
          <label for="tokenInput">Token</label>
          <input
            v-model="token"
            placeholder="Generated Atlassian Token"
            type="password"
            name="tokenInput"
            id="tokenInput"
          />
        </fieldset>

        <div class="buttons">
          <button type="submit">Add Token</button>
        </div>
      </form>
    </template>
    <template v-else>
      <h3>Token Added ✅</h3>
    </template>
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
.add-atlassian-token {
  padding: 20px;
}

fieldset {
  border: none;
  min-height: 48px;
  padding: 5px 0;
}
fieldset + fieldset {
  margin-top: 5px;
}
fieldset > input {
  display: block;
  width: 100%;
  margin-top: 5px;
}

.buttons {
  margin-top: 5px;
  text-align: right;
}
</style>
