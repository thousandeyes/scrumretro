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
