import type { UserProfile } from '../types/api'

/**
 * Vérifie si l'utilisateur a un rôle spécifique (realm ou application)
 * @param profile - Le profil utilisateur contenant les rôles
 * @param role - Le nom du rôle à vérifier
 * @returns true si l'utilisateur a le rôle, false sinon
 * @example
 * ```typescript
 * const profile: UserProfile = { realmRoles: ['admin'], applicationRoles: ['protected-data-read'] }
 * hasRole(profile, 'admin') // true
 * hasRole(profile, 'protected-data-read') // true
 * hasRole(profile, 'customer') // false
 * ```
 */
export function hasRole(profile: UserProfile | null | undefined, role: string): boolean {
  if (!profile) {
    return false
  }

  // Vérifier dans les rôles realm
  if (profile.realmRoles && Array.isArray(profile.realmRoles)) {
    if (profile.realmRoles.includes(role)) {
      return true
    }
  }

  // Vérifier dans les rôles application
  if (profile.applicationRoles && Array.isArray(profile.applicationRoles)) {
    if (profile.applicationRoles.includes(role)) {
      return true
    }
  }

  // Vérifier aussi dans le tableau roles générique (si présent)
  if (profile.roles && Array.isArray(profile.roles)) {
    if (profile.roles.includes(role)) {
      return true
    }
  }

  return false
}

/**
 * Vérifie si l'utilisateur a au moins un des rôles spécifiés
 * @param profile - Le profil utilisateur contenant les rôles
 * @param roles - Un tableau de noms de rôles à vérifier
 * @returns true si l'utilisateur a au moins un des rôles, false sinon
 * @example
 * ```typescript
 * const profile: UserProfile = { realmRoles: ['admin'] }
 * hasAnyRole(profile, ['admin', 'customer']) // true
 * hasAnyRole(profile, ['customer', 'user']) // false
 * ```
 */
export function hasAnyRole(profile: UserProfile | null | undefined, roles: string[]): boolean {
  if (!profile || !roles || roles.length === 0) {
    return false
  }

  return roles.some(role => hasRole(profile, role))
}

/**
 * Vérifie si l'utilisateur a le rôle realm `admin`
 * @param profile - Le profil utilisateur contenant les rôles
 * @returns true si l'utilisateur est administrateur, false sinon
 * @example
 * ```typescript
 * const profile: UserProfile = { realmRoles: ['admin'] }
 * isAdmin(profile) // true
 * 
 * const profile2: UserProfile = { realmRoles: ['customer'] }
 * isAdmin(profile2) // false
 * ```
 */
export function isAdmin(profile: UserProfile | null | undefined): boolean {
  return hasRole(profile, 'admin')
}

/**
 * Vérifie si l'utilisateur peut lire les données protégées
 * L'utilisateur peut lire s'il a le rôle `admin` OU le rôle application `protected-data-read`
 * @param profile - Le profil utilisateur contenant les rôles
 * @returns true si l'utilisateur peut lire les données protégées, false sinon
 * @example
 * ```typescript
 * const profile: UserProfile = { realmRoles: ['admin'] }
 * canReadProtectedData(profile) // true
 * 
 * const profile2: UserProfile = { applicationRoles: ['protected-data-read'] }
 * canReadProtectedData(profile2) // true
 * 
 * const profile3: UserProfile = { realmRoles: ['customer'] }
 * canReadProtectedData(profile3) // false
 * ```
 */
export function canReadProtectedData(profile: UserProfile | null | undefined): boolean {
  if (!profile) {
    return false
  }

  // Le rôle admin a automatiquement tous les droits
  if (isAdmin(profile)) {
    return true
  }

  // Vérifier le rôle application protected-data-read
  return hasRole(profile, 'protected-data-read')
}

/**
 * Vérifie si l'utilisateur peut modifier les données protégées
 * L'utilisateur peut modifier s'il a le rôle `admin` OU le rôle application `protected-data-write`
 * @param profile - Le profil utilisateur contenant les rôles
 * @returns true si l'utilisateur peut modifier les données protégées, false sinon
 * @example
 * ```typescript
 * const profile: UserProfile = { realmRoles: ['admin'] }
 * canWriteProtectedData(profile) // true
 * 
 * const profile2: UserProfile = { applicationRoles: ['protected-data-write'] }
 * canWriteProtectedData(profile2) // true
 * 
 * const profile3: UserProfile = { applicationRoles: ['protected-data-read'] }
 * canWriteProtectedData(profile3) // false
 * ```
 */
export function canWriteProtectedData(profile: UserProfile | null | undefined): boolean {
  if (!profile) {
    return false
  }

  // Le rôle admin a automatiquement tous les droits
  if (isAdmin(profile)) {
    return true
  }

  // Vérifier le rôle application protected-data-write
  return hasRole(profile, 'protected-data-write')
}

