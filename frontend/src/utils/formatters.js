// Format microSTX to STX
export const microSTXToSTX = (microStx) => {
  return (microStx / 1000000).toFixed(6)
}

// Format STX to microSTX
export const stxToMicroSTX = (stx) => {
  return Math.floor(stx * 1000000)
}

// Format principal (shorten address)
export const formatAddress = (principal) => {
  if (!principal) return ''
  if (principal.length <= 16) return principal
  return `${principal.slice(0, 8)}...${principal.slice(-6)}`
}

// Format timestamp to readable date
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

// Format time ago
export const timeAgo = (timestamp) => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
