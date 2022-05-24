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
  <form novalidate @submit.prevent="submit" class="room-login-view">
    <h1>🃏 join room</h1>
    <fieldset>
      <label for="roomNameInput">Room Code</label>
      <input
        v-model="roomName"
        placeholder="XKCD"
        type="text"
        name="roomNameInput"
        id="roomNameInput"
      />
    </fieldset>
    <fieldset>
      <label for="participantNameInput">Your Name</label>
      <input
        v-model="participantName"
        placeholder="Mary Shelley"
        type="text"
        name="participantNameInput"
        id="participantNameInput"
      />
    </fieldset>
    <button type="submit" class="join-button" :disabled="joinDisabled">
      Join
    </button>
  </form>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  props: {
    onJoinRoomClick: {
      type: Function as PropType<OnJoinRoomClick>,
      required: true
    },
    roomNameParam: {
      type: String
    }
  },
  data(): State {
    return {
      roomName: this.roomNameParam,
      participantName: undefined
    };
  },
  computed: {
    joinDisabled(): boolean {
      return false;
    }
  },
  methods: {
    submit() {
      if (this.roomName == null || this.participantName == null) {
        return;
      }
      this.onJoinRoomClick(this.roomName, this.participantName);
      saveName(this.$config.stage, this.participantName);
    }
  },
  mounted() {
    this.participantName = loadName(this.$config.stage);
  }
});

interface State {
  participantName?: string;
  roomName?: string;
}

interface OnJoinRoomClick {
  (roomName: string, participantName: string): void;
}

function loadName(stage: string): string | undefined {
  if (window.localStorage) {
    return window.localStorage[getStorageKey(stage)];
  }
}

function saveName(stage: string, participantName: string) {
  if (window.localStorage) {
    window.localStorage[getStorageKey(stage)] = participantName;
  }
}

function getStorageKey(stage: string) {
  return `${stage}/participant/participantName`;
}
</script>

<style scoped>
.room-login-view > fieldset {
  border: none;
  min-height: 48px;
  padding: 10px 0;
}
.room-login-view > fieldset + fieldset {
  margin-top: 10px;
}
.room-login-view > fieldset > input {
  display: block;
  font-size: 20px;
  width: 100%;
  margin-top: 5px;
}
.join-button {
  margin-top: 10px;
  height: 48px;
}
</style>
