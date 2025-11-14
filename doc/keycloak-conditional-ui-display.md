# Documentation - Affichage conditionnel des composants UI selon les permissions

## Introduction

Cette documentation explique comment les composants UI s'adaptent selon les permissions de l'utilisateur pour masquer/afficher les fonctionnalités selon les rôles Keycloak.

### Vue d'ensemble

Le système d'affichage conditionnel utilise :
- **Helpers de vérification des rôles** : Fonctions dans `utils/roles.ts` pour vérifier les permissions
- **Directives Vue `v-if`** : Pour afficher/masquer les éléments selon les permissions
- **Profil utilisateur** : Récupéré depuis `/oauth2/userinfo` via `getUserInfo()`

### Dépendances

- **Helpers de rôles** : Fonctions de vérification des permissions (feature 005)
- **UserProfile** : Type contenant les rôles de l'utilisateur (feature 005)
- **getUserInfo()** : Fonction pour récupérer le profil utilisateur (feature 003, 005)

## Principe de l'affichage conditionnel

### Logique générale

Les composants UI s'adaptent selon les permissions de l'utilisateur :
- **Utilisateurs avec `protected-data-read`** : Voient uniquement la liste en lecture seule
- **Utilisateurs avec `protected-data-write`** : Voient la liste et tous les boutons (créer, modifier, supprimer)
- **Utilisateurs avec `admin`** : Voient toutes les fonctionnalités (même logique que `protected-data-write`)
- **Utilisateurs sans permissions** : Ne voient pas les données protégées (erreur 403)

### Hiérarchie des permissions

```
admin
  └─> Tous les droits (read + write)

protected-data-write
  └─> Lecture + Écriture (read + write)

protected-data-read
  └─> Lecture uniquement (read only)

customer (sans rôles application)
  └─> Aucun accès aux données protégées
```

## Implémentation dans ProtectedDataView.vue

### Structure du composant

Le composant `ProtectedDataView.vue` gère l'affichage conditionnel des boutons :

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/services/api'
import { canWriteProtectedData } from '@/utils/roles'
import type { UserProfile } from '@/types/api'

const userProfile = ref<UserProfile | null>(null)
const profileLoading = ref(false)

const loadUserProfile = async () => {
  profileLoading.value = true
  try {
    const profile = await getUserInfo()
    userProfile.value = profile
  } finally {
    profileLoading.value = false
  }
}

const canWrite = () => {
  return canWriteProtectedData(userProfile.value)
}

onMounted(async () => {
  await Promise.all([loadData(), loadUserProfile()])
})
</script>
```

### Bouton "Créer"

Le bouton "Créer" est affiché uniquement si l'utilisateur peut écrire :

```vue
<template>
  <div class="actions" v-if="!loading && !error && !profileLoading && canWrite()">
    <button @click="openCreateForm" class="btn btn-primary">Créer</button>
  </div>
</template>
```

**Conditions d'affichage** :
- `!loading` : Les données ne sont pas en cours de chargement
- `!error` : Il n'y a pas d'erreur
- `!profileLoading` : Le profil utilisateur est chargé
- `canWrite()` : L'utilisateur a la permission d'écriture

**Rôles autorisés** :
- `protected-data-write` : Permission d'écriture
- `admin` : Tous les droits

### Boutons "Modifier" et "Supprimer"

Les boutons "Modifier" et "Supprimer" sont affichés uniquement si l'utilisateur peut écrire :

```vue
<template>
  <ul class="data-list">
    <li v-for="item in dataList" :key="item.id" class="data-item">
      <div class="data-description">{{ item.description }}</div>
      <div class="data-actions" v-if="!profileLoading && canWrite()">
        <button @click="openEditForm(item)" class="btn btn-secondary">Modifier</button>
        <button @click="handleDelete(item)" class="btn btn-danger">Supprimer</button>
      </div>
    </li>
  </ul>
</template>
```

**Conditions d'affichage** :
- `!profileLoading` : Le profil utilisateur est chargé
- `canWrite()` : L'utilisateur a la permission d'écriture

**Rôles autorisés** :
- `protected-data-write` : Permission d'écriture
- `admin` : Tous les droits

### Liste en lecture seule

Les utilisateurs avec uniquement `protected-data-read` voient la liste sans les boutons :

```vue
<template>
  <ul class="data-list">
    <li v-for="item in dataList" :key="item.id" class="data-item">
      <div class="data-description">{{ item.description }}</div>
      <!-- Pas de boutons pour les utilisateurs en lecture seule -->
    </li>
  </ul>
</template>
```

**Rôles autorisés** :
- `protected-data-read` : Permission de lecture uniquement
- `protected-data-write` : Permission d'écriture (inclut la lecture)
- `admin` : Tous les droits

## Scénarios d'affichage

### Scénario 1 : Utilisateur avec protected-data-read

**Utilisateur** : `customer-read@dev.io`
**Rôles** : `customer` (realm), `protected-data-read` (application)

**Affichage** :
- ✅ Liste des données protégées (lecture seule)
- ❌ Bouton "Créer" : Non visible
- ❌ Boutons "Modifier" : Non visibles
- ❌ Boutons "Supprimer" : Non visibles

**Code** :
```vue
<div class="actions" v-if="canWrite()">
  <!-- Ne s'affiche pas car canWrite() retourne false -->
</div>
```

### Scénario 2 : Utilisateur avec protected-data-write

**Utilisateur** : `customer-write@dev.io`
**Rôles** : `customer` (realm), `protected-data-write` (application)

**Affichage** :
- ✅ Liste des données protégées
- ✅ Bouton "Créer" : Visible
- ✅ Boutons "Modifier" : Visibles
- ✅ Boutons "Supprimer" : Visibles

**Code** :
```vue
<div class="actions" v-if="canWrite()">
  <!-- S'affiche car canWrite() retourne true -->
  <button @click="openCreateForm">Créer</button>
</div>
```

### Scénario 3 : Utilisateur admin

**Utilisateur** : `administrator@dev.io`
**Rôles** : `admin` (realm)

**Affichage** :
- ✅ Liste des données protégées
- ✅ Bouton "Créer" : Visible
- ✅ Boutons "Modifier" : Visibles
- ✅ Boutons "Supprimer" : Visibles

**Code** :
```vue
<div class="actions" v-if="canWrite()">
  <!-- S'affiche car canWrite() retourne true (admin a tous les droits) -->
  <button @click="openCreateForm">Créer</button>
</div>
```

### Scénario 4 : Utilisateur sans permissions

**Utilisateur** : `customer@dev.io`
**Rôles** : `customer` (realm)

**Affichage** :
- ❌ Liste des données protégées : Erreur 403 (pas d'accès)
- ❌ Bouton "Créer" : Non visible (pas de données chargées)
- ❌ Boutons "Modifier" : Non visibles
- ❌ Boutons "Supprimer" : Non visibles

**Code** :
```vue
<div v-else-if="error" class="error">
  <!-- Affiche l'erreur 403 -->
  <p>Erreur : Vous n'avez pas la permission de lire les données</p>
</div>
```

## Gestion du chargement

### État de chargement du profil

Il est important d'attendre que le profil soit chargé avant d'afficher les boutons :

```typescript
const profileLoading = ref(false)

const loadUserProfile = async () => {
  profileLoading.value = true
  try {
    const profile = await getUserInfo()
    userProfile.value = profile
  } finally {
    profileLoading.value = false
  }
}
```

### Utilisation dans le template

```vue
<template>
  <!-- Attendre que le profil soit chargé -->
  <div class="actions" v-if="!profileLoading && canWrite()">
    <button @click="openCreateForm">Créer</button>
  </div>
</template>
```

**Pourquoi** : Si on n'attend pas le chargement, `canWrite()` pourrait retourner `false` même si l'utilisateur a les permissions, car le profil n'est pas encore chargé.

## Bonnes pratiques

### Vérification des permissions

- Toujours vérifier les permissions avant d'afficher les boutons
- Utiliser les helpers de `utils/roles.ts` plutôt que de vérifier directement les rôles
- Gérer l'état de chargement du profil

### Sécurité

- **Important** : L'affichage conditionnel est uniquement pour l'UX
- L'API doit toujours vérifier les permissions côté serveur
- Ne jamais faire confiance uniquement au front-end pour la sécurité

### Performance

- Charger le profil une seule fois au montage du composant
- Utiliser `ref` pour stocker le profil et le réutiliser
- Éviter de recalculer les permissions à chaque rendu

### Accessibilité

- Les boutons masqués ne doivent pas être dans le DOM (utiliser `v-if` plutôt que `v-show`)
- Fournir des messages d'erreur clairs pour les utilisateurs sans permissions
- Indiquer visuellement les fonctionnalités non disponibles

## Exemples d'utilisation avancée

### Affichage conditionnel avec plusieurs conditions

```vue
<template>
  <div v-if="!profileLoading && canWrite() && !isProcessing">
    <button @click="createData">Créer</button>
  </div>
</template>
```

### Affichage conditionnel avec classes CSS

```vue
<template>
  <div :class="{ 'read-only': !canWrite(), 'editable': canWrite() }">
    <button v-if="canWrite()" @click="editData">Modifier</button>
  </div>
</template>
```

### Affichage conditionnel avec messages

```vue
<template>
  <div v-if="!canWrite()" class="info-message">
    <p>Vous n'avez pas la permission de modifier ces données.</p>
  </div>
  <div v-else>
    <button @click="editData">Modifier</button>
  </div>
</template>
```

## Vérification

### Tester l'affichage conditionnel

1. Connectez-vous avec différents utilisateurs de test
2. Vérifiez que les boutons s'affichent/masquent correctement
3. Vérifiez que les messages d'erreur sont affichés pour les utilisateurs sans permissions
4. Vérifiez que l'état de chargement est géré correctement

### Scénarios de test

- ✅ Utilisateur `customer-read@dev.io` : Liste en lecture seule, pas de boutons
- ✅ Utilisateur `customer-write@dev.io` : Tous les boutons visibles
- ✅ Utilisateur `administrator@dev.io` : Tous les boutons visibles
- ✅ Utilisateur `customer@dev.io` : Erreur 403, pas de données affichées

## Références

- [Documentation Vue.js - Conditional Rendering](https://vuejs.org/guide/essentials/conditional.html)
- [Documentation - Helpers de vérification des rôles](doc/keycloak-role-helpers-frontend.md)

