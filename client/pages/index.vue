<template>
  <div class="menu">
    <h1>🃏 lol scrum retro</h1>
    <nuxt-link to="/play">Play</nuxt-link>
    <nuxt-link to="/host">Host Game</nuxt-link>
  </div>
</template>

<script lang="ts">
export default {
};
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
