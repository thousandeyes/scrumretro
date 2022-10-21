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
