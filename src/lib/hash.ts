/**
 * Simple string hash function that works in both browser and Node.js
 * Note: This is not cryptographically secure, but sufficient for obfuscating IDs
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).padStart(8, '0').substring(0, 8)
}

/**
 * Create a secure URL-safe hash for an ID
 */
export function createSecureId(id: number | string): string {
  const secret = process.env.HASH_SECRET || 'default-secret'
  const hash = simpleHash(`${id}-${secret}`)
  return `${id}-${hash}`
}

/**
 * Extract and verify ID from secure ID format (id-hash)
 * Returns the original ID if valid, null otherwise
 */
export function parseSecureId(secureId: string): number | null {
  const parts = secureId.split('-')
  if (parts.length !== 2) {
    // Try parsing as plain number for backwards compatibility
    const plainId = parseInt(secureId, 10)
    return isNaN(plainId) ? null : plainId
  }
  
  const id = parseInt(parts[0], 10)
  const providedHash = parts[1]
  
  if (isNaN(id)) return null
  
  // Verify the hash
  const secret = process.env.HASH_SECRET || 'default-secret'
  const expectedHash = simpleHash(`${id}-${secret}`)
  
  if (providedHash === expectedHash) {
    return id
  }
  
  return null
}

/**
 * Legacy functions for backwards compatibility
 */
export function hashId(id: number | string): string {
  const secret = process.env.HASH_SECRET || 'default-secret'
  return simpleHash(`${id}-${secret}`)
}

export function unhashId(hashedId: string, candidateId: number | string): boolean {
  const expectedHash = hashId(candidateId)
  return hashedId === expectedHash
}