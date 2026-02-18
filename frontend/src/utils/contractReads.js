import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions'
import { getNetwork } from './network'
import { CONTRACT_ADDRESS, CONTRACT_NAME } from './constants'

/**
 * Fetch a single message by ID from the contract
 * @param {number} messageId - The message ID to fetch
 * @returns {Object|null} The message data or null if not found
 */
export const fetchMessage = async (messageId) => {
  try {
    const network = getNetwork()
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-message',
      functionArgs: [uintCV(messageId)],
      senderAddress: CONTRACT_ADDRESS,
    })

    const json = cvToJSON(result)
    if (!json.value) return null

    const msg = json.value.value
    return {
      id: messageId,
      author: msg.author.value,
      content: msg.content.value,
      timestamp: parseInt(msg.timestamp.value),
      blockHeight: parseInt(msg['block-height'].value),
      expiresAt: parseInt(msg['expires-at'].value),
      pinned: msg.pinned.value,
      pinExpiresAt: parseInt(msg['pin-expires-at'].value),
      reactionCount: parseInt(msg['reaction-count'].value),
      deleted: msg.deleted.value,
      edited: msg.edited.value,
      editCount: parseInt(msg['edit-count'].value),
      replyTo: parseInt(msg['reply-to'].value),
      replyCount: parseInt(msg['reply-count'].value),
    }
  } catch (error) {
    console.error(`Failed to fetch message ${messageId}:`, error)
    return null
  }
}

/**
 * Fetch total message count from the contract
 * @returns {number} Total number of messages
 */
export const fetchTotalMessages = async () => {
  try {
    const network = getNetwork()
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-messages',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
    })

    const json = cvToJSON(result)
    return parseInt(json.value.value)
  } catch (error) {
    console.error('Failed to fetch total messages:', error)
    return 0
  }
}

/**
 * Fetch total fees collected from the contract
 * @returns {number} Total fees in microSTX
 */
export const fetchTotalFees = async () => {
  try {
    const network = getNetwork()
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-fees-collected',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
    })

    const json = cvToJSON(result)
    return parseInt(json.value.value)
  } catch (error) {
    console.error('Failed to fetch total fees:', error)
    return 0
  }
}

/**
 * Fetch all messages from the contract
 * @returns {Array} Array of message objects
 */
export const fetchAllMessages = async () => {
  const total = await fetchTotalMessages()
  const messages = []

  // Fetch messages in parallel batches of 10
  for (let i = 0; i < total; i += 10) {
    const batch = []
    for (let j = i; j < Math.min(i + 10, total); j++) {
      batch.push(fetchMessage(j))
    }
    const results = await Promise.all(batch)
    messages.push(...results.filter(Boolean))
  }

  // Filter out deleted messages and sort by block height (newest first)
  return messages
    .filter((msg) => !msg.deleted)
    .sort((a, b) => b.blockHeight - a.blockHeight)
}

/**
 * Fetch user stats from the contract
 * @param {string} userAddress - The user's STX address
 * @returns {Object|null} User stats or null
 */
export const fetchUserStats = async (userAddress) => {
  try {
    const network = getNetwork()
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [principalCV(userAddress)],
      senderAddress: CONTRACT_ADDRESS,
    })

    const json = cvToJSON(result)
    if (!json.value) return null

    const stats = json.value.value
    return {
      messagesPosted: parseInt(stats['messages-posted'].value),
      totalSpent: parseInt(stats['total-spent'].value),
      lastPostBlock: parseInt(stats['last-post-block'].value),
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return null
  }
}
