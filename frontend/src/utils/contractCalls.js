import { openContractCall } from '@stacks/connect'
import {
  uintCV,
  stringUtf8CV,
  PostConditionMode,
  Pc,
} from '@stacks/transactions'
import { getNetwork } from './network'
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  FEE_POST_MESSAGE,
  FEE_PIN_24HR,
  FEE_PIN_72HR,
  FEE_REACTION,
  PIN_24HR_BLOCKS,
  PIN_72HR_BLOCKS,
} from './constants'

/**
 * Build an STX post condition that limits the exact amount transferred.
 * Ensures the wallet warns the user if the contract tries to move more
 * STX than expected.
 */
const buildSTXPostCondition = (senderAddress, amount) => {
  return Pc.principal(senderAddress).willSendEq(amount).ustx()
}

export const postMessage = async (content, senderAddress) => {
  const network = getNetwork()
  const functionArgs = [stringUtf8CV(content)]

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'post-message',
      functionArgs,
      postConditions: [
        buildSTXPostCondition(senderAddress, FEE_POST_MESSAGE),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}

export const pinMessage = async (messageId, duration24hr, senderAddress) => {
  const network = getNetwork()
  const durationBlocks = duration24hr ? PIN_24HR_BLOCKS : PIN_72HR_BLOCKS
  const fee = duration24hr ? FEE_PIN_24HR : FEE_PIN_72HR

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'pin-message',
      functionArgs: [uintCV(messageId), uintCV(durationBlocks)],
      postConditions: [
        buildSTXPostCondition(senderAddress, fee),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}

export const reactToMessage = async (messageId, senderAddress) => {
  const network = getNetwork()

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'react-to-message',
      functionArgs: [uintCV(messageId)],
      postConditions: [
        buildSTXPostCondition(senderAddress, FEE_REACTION),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}

export const reactToMessageTyped = async (messageId, reactionType, senderAddress) => {
  const network = getNetwork()

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'react-to-message-typed',
      functionArgs: [uintCV(messageId), uintCV(reactionType)],
      postConditions: [
        buildSTXPostCondition(senderAddress, FEE_REACTION),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}

export const editMessage = async (messageId, newContent) => {
  const network = getNetwork()

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'edit-message',
      functionArgs: [uintCV(messageId), stringUtf8CV(newContent)],
      postConditions: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}

export const deleteMessage = async (messageId) => {
  const network = getNetwork()

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'delete-message',
      functionArgs: [uintCV(messageId)],
      postConditions: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}

export const replyToMessage = async (parentId, content, senderAddress) => {
  const network = getNetwork()

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'reply-to-message',
      functionArgs: [uintCV(parentId), stringUtf8CV(content)],
      postConditions: [
        buildSTXPostCondition(senderAddress, FEE_POST_MESSAGE),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}

export const setDisplayName = async (name) => {
  const network = getNetwork()

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'set-display-name',
      functionArgs: [stringUtf8CV(name)],
      postConditions: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject(new Error('UserRejected')),
    }).catch(reject)
  })
}
