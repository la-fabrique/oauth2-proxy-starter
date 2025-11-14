<script setup lang="ts">
const handleSignout = () => {
  // Redirection vers l'endpoint oauth2-proxy pour le signout
  // Oauth2-proxy gère l'invalidation de la session et la redirection vers l'authentification
  window.location.href = '/oauth2/sign_out'
}
</script>

<template>
  <button class="signout-button" @click="handleSignout">
    Signout
  </button>
</template>

<style scoped>
.signout-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: inherit;
}

.signout-button:hover {
  background-color: #c82333;
}
</style>

