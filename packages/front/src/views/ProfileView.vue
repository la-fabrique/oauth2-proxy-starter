<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { UserProfile } from '../types/api'
import { getUserInfo } from '../services/api'

// État du composant
const userProfile = ref<UserProfile | null>(null)
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

// Charger les informations utilisateur au montage du composant
onMounted(async () => {
  loading.value = true
  error.value = null

  const data = await getUserInfo()

  if (data) {
    userProfile.value = data
  } else {
    error.value = 'Impossible de récupérer les informations utilisateur. Veuillez vous assurer que vous êtes authentifié.'
  }

  loading.value = false
})

// Fonction pour formater le JSON de manière propre
const formatJson = (data: UserProfile | null): string => {
  if (!data) {
    return '{}'
  }
  return JSON.stringify(data, null, 2)
}

// Fonction pour obtenir les rôles realm
const getRealmRoles = (profile: UserProfile | null): string[] => {
  if (!profile) return []
  return profile.realmRoles || []
}

// Fonction pour obtenir les rôles application
const getApplicationRoles = (profile: UserProfile | null): string[] => {
  if (!profile) return []
  return profile.applicationRoles || []
}
</script>

<template>
  <div class="profile">
    <h1>Profil utilisateur</h1>
    <div class="profile-content">
      <div v-if="loading" class="loading">Chargement des informations utilisateur...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <!-- Informations de base -->
        <div class="profile-section">
          <h2>Informations</h2>
          <div class="info-item" v-if="userProfile?.email">
            <strong>Email :</strong> {{ userProfile.email }}
          </div>
          <div class="info-item" v-if="userProfile?.preferredUsername">
            <strong>Nom d'utilisateur :</strong> {{ userProfile.preferredUsername }}
          </div>
        </div>

        <!-- Rôles Realm -->
        <div class="profile-section" v-if="getRealmRoles(userProfile).length > 0">
          <h2>Rôles Realm</h2>
          <div class="roles-list">
            <span v-for="role in getRealmRoles(userProfile)" :key="role" class="role-badge realm">
              {{ role }}
            </span>
          </div>
        </div>

        <!-- Rôles Application -->
        <div class="profile-section" v-if="getApplicationRoles(userProfile).length > 0">
          <h2>Rôles Application</h2>
          <div class="roles-list">
            <span v-for="role in getApplicationRoles(userProfile)" :key="role" class="role-badge application">
              {{ role }}
            </span>
          </div>
        </div>

        <!-- JSON complet (replié par défaut) -->
        <details class="json-section">
          <summary>Voir toutes les informations (JSON)</summary>
          <pre class="json-display">{{ formatJson(userProfile) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #42b983;
  margin-bottom: 2rem;
  text-align: center;
}

.profile-content {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.json-display {
  margin: 0;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #333;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #666;
  font-style: italic;
}

.error {
  padding: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
}

.profile-section {
  margin-bottom: 1.5rem;
}

.profile-section h2 {
  color: #42b983;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

.info-item {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #ffffff;
  border-radius: 4px;
}

.info-item strong {
  color: #42b983;
  margin-right: 0.5rem;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
}

.role-badge.realm {
  background-color: #42b983;
}

.role-badge.application {
  background-color: #3498db;
}

.json-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.json-section summary {
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.json-section summary:hover {
  color: #42b983;
}
</style>
