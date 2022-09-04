<template>
  <div class="sync-notes">
    <h3>Sync Notes to confluence</h3>
    <select class="team-options" v-model="teamSelected">
      <option value=null>Please select a team</option>
      <option value="amber">Amber</option>
      <option value="client">Client</option>
      <option value="rivia">Rivia</option>
    </select>
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
import SyncNotesState, { Team } from "../models/SyncNotesState";

export default Vue.extend({
  props: {
    onSync: {
      type: Function as PropType<(value: string, team: Team) => void>,
      default: () => {}
    },
    state: {
      type: Object as PropType<SyncNotesState>,
      required: true
    }
  },
  data(): { value: string | null; error: string | null; teamSelected: string | null } {
    return { value: null, error: null, teamSelected: null };
  },
  methods: {
    sync() {
      if ( this.teamSelected === null ) {
        this.error = "No team selected, please select a team";
        return;
      }

      let team: Team | null = null;

      switch(this.teamSelected) {
        case 'amber':
          team = Team.AMBER;
          break;
        case 'client':
          team = Team.CLIENT;
          break;
        case 'rivia':
          team = Team.RIVIA;
          break;
        default:
          this.error = "Unexpected team detected, please ask the dev team to investigate";
          return;
      } 

      this.onSync(this.value, team);
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

.team-options {
  margin-top: 5px;
  display: flex;
  border: 1px solid #ddd;
  background: white;
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
