<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ProtectedData, UserProfile } from '../types/api'
import { getProtectedData, createProtectedData, updateProtectedData, deleteProtectedData, getUserInfo } from '../services/api'
import { canWriteProtectedData } from '../utils/roles'

const dataList = ref<ProtectedData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const userProfile = ref<UserProfile | null>(null)
const profileLoading = ref(false)

// État du formulaire
const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingItem = ref<ProtectedData | null>(null)
const formDescription = ref('')
const formLoading = ref(false)
const formError = ref<string | null>(null)
const deletingId = ref<string | null>(null)

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    dataList.value = await getProtectedData()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des données'
  } finally {
    loading.value = false
  }
}

const openCreateForm = () => {
  formMode.value = 'create'
  editingItem.value = null
  formDescription.value = ''
  formError.value = null
  showForm.value = true
}

const openEditForm = (item: ProtectedData) => {
  formMode.value = 'edit'
  editingItem.value = item
  formDescription.value = item.description
  formError.value = null
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  formDescription.value = ''
  formError.value = null
  editingItem.value = null
}

const submitForm = async () => {
  if (!formDescription.value.trim()) {
    formError.value = 'La description est requise'
    return
  }

  formLoading.value = true
  formError.value = null

  try {
    if (formMode.value === 'create') {
      await createProtectedData(formDescription.value)
    } else if (editingItem.value) {
      await updateProtectedData(editingItem.value.id, formDescription.value)
    }

    closeForm()
    await loadData()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (item: ProtectedData) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer cette donnée ?\n\n"${item.description}"`)) {
    return
  }

  deletingId.value = item.id
  error.value = null

  try {
    await deleteProtectedData(item.id)
    await loadData()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression'
  } finally {
    deletingId.value = null
  }
}

const loadUserProfile = async () => {
  profileLoading.value = true
  try {
    const profile = await getUserInfo()
    userProfile.value = profile
    // Debug: afficher le profil pour diagnostiquer les problèmes
    if (profile) {
      console.log('Profil utilisateur chargé:', {
        email: profile.email,
        realmRoles: profile.realmRoles,
        applicationRoles: profile.applicationRoles,
        groups: (profile as any).groups,
        canWrite: canWriteProtectedData(profile)
      })
    }
  } catch (err) {
    console.error('Erreur lors du chargement du profil utilisateur:', err)
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

<template>
  <div class="protected-data">
    <h1>Données protégées</h1>

    <div class="actions" v-if="!loading && !error && !profileLoading && canWrite()">
      <button @click="openCreateForm" class="btn btn-primary">Créer</button>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="error" class="error">
      <p>Erreur : {{ error }}</p>
      <button @click="loadData">Réessayer</button>
    </div>

    <div v-else-if="dataList.length === 0" class="empty">
      <p>Aucune donnée protégée disponible</p>
    </div>

    <ul v-else class="data-list">
      <li v-for="item in dataList" :key="item.id" class="data-item">
        <div class="data-id">ID: {{ item.id }}</div>
        <div class="data-description">{{ item.description }}</div>
        <div class="data-actions" v-if="!profileLoading && canWrite()">
          <button @click="openEditForm(item)" class="btn btn-secondary">Modifier</button>
          <button
            @click="handleDelete(item)"
            :disabled="deletingId === item.id"
            class="btn btn-danger"
          >
            {{ deletingId === item.id ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </li>
    </ul>

    <!-- Modal/Form pour créer ou modifier -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ formMode === 'create' ? 'Créer une donnée' : 'Modifier la donnée' }}</h2>
          <button @click="closeForm" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="description">Description :</label>
              <textarea
                id="description"
                v-model="formDescription"
                rows="4"
                required
                :disabled="formLoading"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeForm" :disabled="formLoading" class="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" :disabled="formLoading" class="btn btn-primary">
                {{ formLoading ? 'Enregistrement...' : (formMode === 'create' ? 'Créer' : 'Modifier') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.protected-data {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #42b983;
  margin-bottom: 2rem;
  text-align: center;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #e74c3c;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error button:hover {
  background-color: #35a372;
}

.data-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.data-item {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;
}

.data-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-id {
  font-weight: bold;
  color: #42b983;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.data-description {
  color: #333;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.data-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #35a372;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #42b983;
  font-size: 1.3rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-error {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #c33;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>
