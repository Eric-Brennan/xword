<template>
    <div class="h-100">
        <router-view />
    </div>
  <!--<div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>-->
</template>

<style lang="scss">
    @import './src/style/index';

    @font-face {
        font-family: "Xword";
        src: url('../src/assets/font.otf');
        font-style: oblique;
        font-weight: bold;
    }

#app {
  font-family: Xword, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
