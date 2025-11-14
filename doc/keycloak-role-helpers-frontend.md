# Documentation - Helpers de vérification des rôles dans le front-end

## Introduction

Cette documentation explique comment utiliser les helpers de vérification des rôles dans le front-end Vue.js pour contrôler l'affichage conditionnel des composants et des fonctionnalités selon les permissions de l'utilisateur.

### Vue d'ensemble

Les helpers de vérification des rôles sont définis dans `packages/front/src/utils/roles.ts` et permettent de :
- Vérifier si un utilisateur a un rôle spécifique
- Vérifier si un utilisateur a au moins un rôle parmi une liste
- Vérifier si un utilisateur est administrateur
- Vérifier si un utilisateur peut lire/écrire des données protégées

### Dépendances

- **UserProfile** : Type contenant les rôles de l'utilisateur (feature 005)
- **getUserInfo()** : Fonction pour récupérer le profil utilisateur depuis `/oauth2/userinfo` (feature 003, 005)

## Structure des helpers

### Fichier roles.ts

Tous les helpers sont définis dans `packages/front/src/utils/roles.ts` :

```typescript
import type { UserProfile } from '../types/api'

// Helpers de base
export function hasRole(profile: UserProfile | null | undefined, role: string): boolean
export function hasAnyRole(profile: UserProfile | null | undefined, roles: string[]): boolean
export function isAdmin(profile: UserProfile | null | undefined): boolean

// Helpers spécifiques aux permissions
export function canReadProtectedData(profile: UserProfile | null | undefined): boolean
export function canWriteProtectedData(profile: UserProfile | null | undefined): boolean
```

## Helpers de base

### hasRole()

Vérifie si l'utilisateur a un rôle spécifique (realm ou application).

**Signature** :
```typescript
export function hasRole(
  profile: UserProfile | null | undefined, 
  role: string
): boolean
```

**Paramètres** :
- `profile` : Le profil utilisateur contenant les rôles (peut être `null` ou `undefined`)
- `role` : Le nom du rôle à vérifier (ex: `"admin"`, `"protected-data-read"`)

**Retourne** : `true` si l'utilisateur a le rôle, `false` sinon

**Exemple** :
```typescript
import { hasRole } from '@/utils/roles'

const profile: UserProfile = { 
  realmRoles: ['admin'], 
  applicationRoles: ['protected-data-read'] 
}

hasRole(profile, 'admin') // true
hasRole(profile, 'protected-data-read') // true
hasRole(profile, 'customer') // false
hasRole(null, 'admin') // false
```

**Logique** :
1. Vérifie dans `realmRoles` si présent
2. Vérifie dans `applicationRoles` si présent
3. Vérifie dans `roles` (générique) si présent
4. Retourne `false` si le profil est `null` ou `undefined`

### hasAnyRole()

Vérifie si l'utilisateur a au moins un des rôles spécifiés.

**Signature** :
```typescript
export function hasAnyRole(
  profile: UserProfile | null | undefined, 
  roles: string[]
): boolean
```

**Paramètres** :
- `profile` : Le profil utilisateur contenant les rôles
- `roles` : Un tableau de noms de rôles à vérifier

**Retourne** : `true` si l'utilisateur a au moins un des rôles, `false` sinon

**Exemple** :
```typescript
import { hasAnyRole } from '@/utils/roles'

const profile: UserProfile = { realmRoles: ['admin'] }

hasAnyRole(profile, ['admin', 'customer']) // true
hasAnyRole(profile, ['customer', 'user']) // false
hasAnyRole(null, ['admin']) // false
```

**Logique** :
- Utilise `hasRole()` pour vérifier chaque rôle
- Retourne `true` dès qu'un rôle est trouvé
- Retourne `false` si aucun rôle n'est trouvé ou si le profil est `null`/`undefined`

### isAdmin()

Vérifie si l'utilisateur a le rôle realm `admin`.

**Signature** :
```typescript
export function isAdmin(profile: UserProfile | null | undefined): boolean
```

**Paramètres** :
- `profile` : Le profil utilisateur contenant les rôles

**Retourne** : `true` si l'utilisateur est administrateur, `false` sinon

**Exemple** :
```typescript
import { isAdmin } from '@/utils/roles'

const profile: UserProfile = { realmRoles: ['admin'] }
isAdmin(profile) // true

const profile2: UserProfile = { realmRoles: ['customer'] }
isAdmin(profile2) // false
```

**Logique** :
- Utilise `hasRole(profile, 'admin')` pour vérifier le rôle `admin`

## Helpers spécifiques aux permissions

### canReadProtectedData()

Vérifie si l'utilisateur peut lire les données protégées.

**Signature** :
```typescript
export function canReadProtectedData(
  profile: UserProfile | null | undefined
): boolean
```

**Paramètres** :
- `profile` : Le profil utilisateur contenant les rôles

**Retourne** : `true` si l'utilisateur peut lire, `false` sinon

**Exemple** :
```typescript
import { canReadProtectedData } from '@/utils/roles'

const profile: UserProfile = { realmRoles: ['admin'] }
canReadProtectedData(profile) // true

const profile2: UserProfile = { applicationRoles: ['protected-data-read'] }
canReadProtectedData(profile2) // true

const profile3: UserProfile = { realmRoles: ['customer'] }
canReadProtectedData(profile3) // false
```

**Logique** :
1. Vérifie si l'utilisateur est `admin` (tous les droits)
2. Sinon, vérifie si l'utilisateur a le rôle `protected-data-read`
3. Retourne `false` si le profil est `null` ou `undefined`

**Rôles autorisés** :
- `admin` : Accès complet
- `protected-data-read` : Permission de lecture

### canWriteProtectedData()

Vérifie si l'utilisateur peut écrire (créer, modifier, supprimer) les données protégées.

**Signature** :
```typescript
export function canWriteProtectedData(
  profile: UserProfile | null | undefined
): boolean
```

**Paramètres** :
- `profile` : Le profil utilisateur contenant les rôles

**Retourne** : `true` si l'utilisateur peut écrire, `false` sinon

**Exemple** :
```typescript
import { canWriteProtectedData } from '@/utils/roles'

const profile: UserProfile = { realmRoles: ['admin'] }
canWriteProtectedData(profile) // true

const profile2: UserProfile = { applicationRoles: ['protected-data-write'] }
canWriteProtectedData(profile2) // true

const profile3: UserProfile = { applicationRoles: ['protected-data-read'] }
canWriteProtectedData(profile3) // false
```

**Logique** :
1. Vérifie si l'utilisateur est `admin` (tous les droits)
2. Sinon, vérifie si l'utilisateur a le rôle `protected-data-write`
3. Retourne `false` si le profil est `null` ou `undefined`

**Rôles autorisés** :
- `admin` : Accès complet
- `protected-data-write` : Permission d'écriture

## Utilisation dans les composants Vue

### Récupération du profil utilisateur

Avant d'utiliser les helpers, il faut récupérer le profil utilisateur :

```typescript
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/services/api'
import type { UserProfile } from '@/types/api'

const userProfile = ref<UserProfile | null>(null)

const loadUserProfile = async () => {
  const profile = await getUserInfo()
  userProfile.value = profile
}

onMounted(() => {
  loadUserProfile()
})
```

### Utilisation dans le template

Les helpers sont utilisés dans les directives `v-if` pour l'affichage conditionnel :

```vue
<template>
  <div>
    <!-- Afficher uniquement si l'utilisateur peut écrire -->
    <button v-if="canWrite()" @click="createData">
      Créer
    </button>

    <!-- Afficher uniquement si l'utilisateur peut lire -->
    <div v-if="canRead()">
      <ul>
        <li v-for="item in dataList" :key="item.id">
          {{ item.description }}
          <!-- Afficher les boutons uniquement si l'utilisateur peut écrire -->
          <button v-if="canWrite()" @click="editItem(item)">
            Modifier
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { canWriteProtectedData, canReadProtectedData } from '@/utils/roles'

const canWrite = () => {
  return canWriteProtectedData(userProfile.value)
}

const canRead = () => {
  return canReadProtectedData(userProfile.value)
}
</script>
```

### Exemple complet : ProtectedDataView.vue

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/services/api'
import { canWriteProtectedData } from '@/utils/roles'
import type { UserProfile } from '@/types/api'

const userProfile = ref<UserProfile | null>(null)

const loadUserProfile = async () => {
  const profile = await getUserInfo()
  userProfile.value = profile
}

const canWrite = () => {
  return canWriteProtectedData(userProfile.value)
}

onMounted(async () => {
  await loadUserProfile()
})
</script>

<template>
  <div class="protected-data">
    <h1>Données protégées</h1>

    <!-- Bouton Créer : affiché uniquement si l'utilisateur peut écrire -->
    <div class="actions" v-if="canWrite()">
      <button @click="openCreateForm" class="btn btn-primary">Créer</button>
    </div>

    <ul class="data-list">
      <li v-for="item in dataList" :key="item.id" class="data-item">
        <div class="data-description">{{ item.description }}</div>
        <!-- Boutons Modifier/Supprimer : affichés uniquement si l'utilisateur peut écrire -->
        <div class="data-actions" v-if="canWrite()">
          <button @click="openEditForm(item)" class="btn btn-secondary">Modifier</button>
          <button @click="handleDelete(item)" class="btn btn-danger">Supprimer</button>
        </div>
      </li>
    </ul>
  </div>
</template>
```

## Gestion du chargement du profil

### État de chargement

Il est important de gérer l'état de chargement du profil pour éviter d'afficher les boutons avant que le profil soit chargé :

```typescript
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
```

### Utilisation avec l'état de chargement

```vue
<template>
  <!-- Attendre que le profil soit chargé avant d'afficher les boutons -->
  <div class="actions" v-if="!profileLoading && canWrite()">
    <button @click="openCreateForm">Créer</button>
  </div>
</template>
```

## Bonnes pratiques

### Vérification du profil

- Toujours vérifier que le profil n'est pas `null` ou `undefined` avant d'utiliser les helpers
- Les helpers gèrent déjà ce cas et retournent `false` si le profil est `null`

### Performance

- Ne pas appeler `getUserInfo()` à chaque rendu
- Charger le profil une fois au montage du composant
- Utiliser `ref` pour stocker le profil et le réutiliser

### Sécurité

- Ne jamais faire confiance uniquement au front-end pour la sécurité
- Les vérifications dans le front-end sont uniquement pour l'UX
- L'API doit toujours vérifier les permissions côté serveur

## Exemples d'utilisation avancée

### Vérification de plusieurs rôles

```typescript
import { hasAnyRole } from '@/utils/roles'

// Vérifier si l'utilisateur a au moins un des rôles
const canAccess = () => {
  return hasAnyRole(userProfile.value, ['admin', 'manager', 'supervisor'])
}
```

### Vérification conditionnelle complexe

```typescript
import { isAdmin, hasRole } from '@/utils/roles'

const canEdit = () => {
  if (!userProfile.value) return false
  // Admin peut tout faire
  if (isAdmin(userProfile.value)) return true
  // Vérifier le rôle spécifique
  return hasRole(userProfile.value, 'editor')
}
```

## Références

- [Documentation Vue.js - Conditional Rendering](https://vuejs.org/guide/essentials/conditional.html)
- [Documentation TypeScript - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

