/**
 * Map Clarity contract error codes to human-readable messages.
 *
 * The contract defines errors u100 – u110. When a transaction is rejected
 * on-chain the error code surfaces in the API response body. This map
 * lets the UI show actionable feedback instead of raw codes.
 */
export const CLARITY_ERROR_MESSAGES = {
  u100: 'Only the contract owner can perform this action.',
  u101: 'Message not found.',
  u102: 'You can only modify your own messages.',
  u103: 'Message is empty or exceeds the 280-character limit.',
  u104: 'Invalid message ID.',
  u105: 'You have already reacted to this message.',
  u106: 'Please wait about an hour between posts (6-block cooldown).',
  u107: 'The message board is temporarily paused.',
  u108: 'Insufficient STX balance for this action.',
  u109: 'Message has been deleted.',
  u110: 'Invalid input provided.',
}

/**
 * Attempt to extract a Clarity error code from a transaction error
 * and return a friendly message.
 */
export const parseClarityError = (error) => {
  if (!error) return 'An unknown error occurred.'

  const message = typeof error === 'string' ? error : error.message || ''

  // Match patterns like "(err u106)" or "u106"
  const match = message.match(/u1[01]\d/)
  if (match && CLARITY_ERROR_MESSAGES[match[0]]) {
    return CLARITY_ERROR_MESSAGES[match[0]]
  }

  if (message.includes('UserRejected') || message.includes('cancelled')) {
    return null // user cancelled intentionally — no toast needed
  }

  return message || 'Transaction failed. Please try again.'
}
