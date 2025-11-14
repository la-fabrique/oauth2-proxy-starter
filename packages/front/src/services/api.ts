import type { ProtectedData, UserProfile } from '../types/api'

/**
 * Récupère toutes les données protégées
 * Appel API vers GET /api/ProtectedData
 * @returns Promise qui se résout avec un tableau de ProtectedData
 */
export async function getProtectedData(): Promise<ProtectedData[]> {
  try {
    const response = await fetch('/api/ProtectedData', {
      method: 'GET',
      credentials: 'include', // Inclure les cookies de session pour l'authentification
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Utilisateur non authentifié')
      }
      if (response.status === 403) {
        throw new Error('Vous n\'avez pas la permission de lire les données')
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    const data: ProtectedData[] = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des données protégées:', error)
    throw error
  }
}

/**
 * Récupère une donnée protégée par son ID
 * Appel API vers GET /api/ProtectedData/:id
 * @param id - L'identifiant de la donnée à récupérer
 * @returns Promise qui se résout avec un ProtectedData ou null si non trouvé
 */
export async function getProtectedDataById(id: string): Promise<ProtectedData | null> {
  try {
    const response = await fetch(`/api/ProtectedData/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Utilisateur non authentifié')
      }
      if (response.status === 403) {
        throw new Error('Vous n\'avez pas la permission de lire les données')
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    const data: ProtectedData = await response.json()
    return data
  } catch (error) {
    console.error(`Erreur lors de la récupération de la donnée protégée ${id}:`, error)
    throw error
  }
}

/**
 * Crée une nouvelle donnée protégée
 * Appel API vers POST /api/ProtectedData
 * @param description - La description de la nouvelle donnée
 * @returns Promise qui se résout avec le ProtectedData créé
 */
export async function createProtectedData(description: string): Promise<ProtectedData> {
  try {
    const response = await fetch('/api/ProtectedData', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Utilisateur non authentifié')
      }
      if (response.status === 403) {
        throw new Error('Vous n\'avez pas la permission de créer des données')
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    const data: ProtectedData = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la création de la donnée protégée:', error)
    throw error
  }
}

/**
 * Met à jour une donnée protégée existante
 * Appel API vers PUT /api/ProtectedData/:id
 * @param id - L'identifiant de la donnée à mettre à jour
 * @param description - La nouvelle description
 * @returns Promise qui se résout avec le ProtectedData mis à jour ou null si non trouvé
 */
export async function updateProtectedData(
  id: string,
  description: string,
): Promise<ProtectedData | null> {
  try {
    const response = await fetch(`/api/ProtectedData/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Utilisateur non authentifié')
      }
      if (response.status === 403) {
        throw new Error('Vous n\'avez pas la permission de modifier des données')
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    const data: ProtectedData = await response.json()
    return data
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la donnée protégée ${id}:`, error)
    throw error
  }
}

/**
 * Supprime une donnée protégée
 * Appel API vers DELETE /api/ProtectedData/:id
 * @param id - L'identifiant de la donnée à supprimer
 * @returns Promise qui se résout avec true si supprimé, false sinon
 */
export async function deleteProtectedData(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/ProtectedData/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      return false
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Utilisateur non authentifié')
      }
      if (response.status === 403) {
        throw new Error('Vous n\'avez pas la permission de supprimer des données')
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    // DELETE retourne 204 No Content en cas de succès
    return true
  } catch (error) {
    console.error(`Erreur lors de la suppression de la donnée protégée ${id}:`, error)
    throw error
  }
}

/**
 * Transforme les groupes retournés par oauth2-proxy en rôles realm et application
 * Format oauth2-proxy: groups: ["role:admin", "role:oauth-starter-client:protected-data-read"]
 * Format attendu: realmRoles: ["admin"], applicationRoles: ["protected-data-read"]
 *
 * Gère aussi les cas où les rôles sont déjà dans le bon format ou dans d'autres formats
 */
function transformRoles(data: UserProfile): UserProfile {
  // Si les rôles sont déjà présents et correctement formatés, les utiliser
  if (data.realmRoles && Array.isArray(data.realmRoles) &&
      data.applicationRoles && Array.isArray(data.applicationRoles)) {
    return data
  }

  const realmRoles: string[] = []
  const applicationRoles: string[] = []

  // Récupérer les rôles realm existants s'ils sont déjà présents
  if (data.realmRoles && Array.isArray(data.realmRoles)) {
    realmRoles.push(...data.realmRoles)
  }

  // Récupérer les rôles application existants s'ils sont déjà présents
  if (data.applicationRoles && Array.isArray(data.applicationRoles)) {
    applicationRoles.push(...data.applicationRoles)
  }

  // Traiter les groupes depuis oauth2-proxy
  const groups = data.groups as string[] | undefined
  if (groups && Array.isArray(groups)) {
    for (const group of groups) {
      if (typeof group !== 'string') continue

      // Format: "role:admin" -> realm role "admin"
      if (group.startsWith('role:') && group.split(':').length === 2) {
        const role = group.substring(5) // Enlever "role:"
        if (role && !realmRoles.includes(role)) {
          realmRoles.push(role)
        }
      }
      // Format: "role:oauth-starter-client:protected-data-read" -> application role "protected-data-read"
      else if (group.startsWith('role:oauth-starter-client:')) {
        const role = group.substring(26) // Enlever "role:oauth-starter-client:"
        if (role && !applicationRoles.includes(role)) {
          applicationRoles.push(role)
        }
      }
    }
  }

  // Essayer aussi d'extraire depuis realm_access et resource_access si présents
  // Ces champs peuvent être présents dans la réponse de /oauth2/userinfo
  interface UserInfoWithAccess {
    realm_access?: { roles?: string[] }
    resource_access?: { [clientId: string]: { roles?: string[] } }
  }
  const dataWithAccess = data as UserProfile & UserInfoWithAccess
  if (dataWithAccess.realm_access?.roles && Array.isArray(dataWithAccess.realm_access.roles)) {
    for (const role of dataWithAccess.realm_access.roles) {
      if (typeof role === 'string' && !realmRoles.includes(role)) {
        realmRoles.push(role)
      }
    }
  }

  if (dataWithAccess.resource_access?.['oauth-starter-client']?.roles &&
      Array.isArray(dataWithAccess.resource_access['oauth-starter-client'].roles)) {
    for (const role of dataWithAccess.resource_access['oauth-starter-client'].roles) {
      if (typeof role === 'string' && !applicationRoles.includes(role)) {
        applicationRoles.push(role)
      }
    }
  }

  return {
    ...data,
    realmRoles: realmRoles.length > 0 ? realmRoles : undefined,
    applicationRoles: applicationRoles.length > 0 ? applicationRoles : undefined,
  }
}

/**
 * Récupère les informations utilisateur depuis l'endpoint /oauth2/userinfo
 * L'endpoint est fourni par oauth2-proxy et retourne les informations de l'utilisateur authentifié
 * @returns Promise qui se résout avec les informations utilisateur ou null en cas d'erreur
 */
export async function getUserInfo(): Promise<UserProfile | null> {
  try {
    const response = await fetch('/oauth2/userinfo', {
      method: 'GET',
      credentials: 'include', // Inclure les cookies de session
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Gérer les erreurs HTTP (401, 403, 500, etc.)
      if (response.status === 401 || response.status === 403) {
        throw new Error('Utilisateur non authentifié')
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    const data: UserProfile = await response.json()
    // Transformer les groupes en rôles realm et application
    return transformRoles(data)
  } catch (error) {
    // Gérer les erreurs réseau ou autres erreurs
    console.error('Erreur lors de la récupération des informations utilisateur:', error)
    return null
  }
}
