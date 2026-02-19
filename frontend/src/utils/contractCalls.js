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

  const functionArgs = [
    stringUtf8CV(content),
  ]

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
      onFinish: (data) => {
        resolve(data.txId)
      },
      onCancel: () => {
        reject(new Error('UserRejected'))
      },
    }).catch(reject)
  })
}

export const pinMessage = async (messageId, duration24hr, senderAddress) => {
  const network = getNetwork()
  const durationBlocks = duration24hr ? PIN_24HR_BLOCKS : PIN_72HR_BLOCKS
  const fee = duration24hr ? FEE_PIN_24HR : FEE_PIN_72HR

  const functionArgs = [
    uintCV(messageId),
    uintCV(durationBlocks),
  ]

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'pin-message',
      functionArgs,
      postConditions: [
        buildSTXPostCondition(senderAddress, fee),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        resolve(data.txId)
      },
      onCancel: () => {
        reject(new Error('UserRejected'))
      },
    }).catch(reject)
  })
}

export const reactToMessage = async (messageId, senderAddress) => {
  const network = getNetwork()

  const functionArgs = [
    uintCV(messageId),
  ]

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'react-to-message',
      functionArgs,
      postConditions: [
        buildSTXPostCondition(senderAddress, FEE_REACTION),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        resolve(data.txId)
      },
      onCancel: () => {
        reject(new Error('UserRejected'))
      },
    }).catch(reject)
  })
}
