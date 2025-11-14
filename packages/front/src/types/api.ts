/**
 * Type représentant une donnée protégée retournée par l'API
 */
export interface ProtectedData {
  id: string
  description: string
}

/**
 * Type représentant les informations de profil utilisateur
 */
export type UserProfile  = Record<string, unknown> & {
  email?: string
  preferredUsername?: string
  roles?: string[]
  realmRoles?: string[]
  applicationRoles?: string[]
}
