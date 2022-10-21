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
  <div class="menu">
    <h1>🃏 lol scrum retro</h1>
    <nuxt-link to="/play">Play</nuxt-link>
    <nuxt-link to="/host">Host Game</nuxt-link>
    <p>
      Made by <a href="https://www.thousandeyes.com/" target="_blank">ThousandEyes</a> (part of Cisco)
      | Licenced under <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">AGPLv3</a>
      | <a href="https://github.com/thousandeyes/scrumretro" target="_blank">Source on GitHub</a>
    </p>
  </div>
</template>

<script lang="ts">
export default {};
</script>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.menu > a {
  display: block;
  padding: 15px;
  margin: 5px 0;
  background-color: #d1d1d1;
  text-align: center;
  text-decoration: none;
}
.menu > a:hover {
  background-color: #ffc583;
}
</style>
