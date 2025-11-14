<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import SignoutButton from './components/SignoutButton.vue'
</script>

<template>
  <div id="app">
    <nav>
      <RouterLink to="/">Accueil</RouterLink>
      <RouterLink to="/profile">Profil</RouterLink>
      <RouterLink to="/protected-data">Données protégées</RouterLink>
      <SignoutButton />
    </nav>
    <RouterView />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}

nav {
  padding: 1rem 2rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

nav a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

nav a:hover {
  background-color: #e0e0e0;
}

nav a.router-link-active {
  background-color: #42b983;
  color: white;
}

nav > :last-child {
  margin-left: auto;
}
</style>
