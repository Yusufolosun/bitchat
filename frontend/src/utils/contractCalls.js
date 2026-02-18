import { openContractCall } from '@stacks/connect'
import {
  uintCV,
  stringUtf8CV,
  PostConditionMode,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
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
  return makeStandardSTXPostCondition(
    senderAddress,
    FungibleConditionCode.Equal,
    amount
  )
}

export const postMessage = async (content, senderAddress) => {
  const network = getNetwork()

  const functionArgs = [
    stringUtf8CV(content),
  ]

  const options = {
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
      console.log('Transaction ID:', data.txId)
      return data.txId
    },
    onCancel: () => {
      console.log('Transaction cancelled')
    },
  }

  await openContractCall(options)
}

export const pinMessage = async (messageId, duration24hr, senderAddress) => {
  const network = getNetwork()
  const durationBlocks = duration24hr ? PIN_24HR_BLOCKS : PIN_72HR_BLOCKS
  const fee = duration24hr ? FEE_PIN_24HR : FEE_PIN_72HR

  const functionArgs = [
    uintCV(messageId),
    uintCV(durationBlocks),
  ]

  const options = {
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
      console.log('Pin Transaction ID:', data.txId)
      return data.txId
    },
    onCancel: () => {
      console.log('Pin transaction cancelled')
    },
  }

  await openContractCall(options)
}

export const reactToMessage = async (messageId, senderAddress) => {
  const network = getNetwork()

  const functionArgs = [
    uintCV(messageId),
  ]

  const options = {
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
      console.log('Reaction Transaction ID:', data.txId)
      return data.txId
    },
    onCancel: () => {
      console.log('Reaction transaction cancelled')
    },
  }

  await openContractCall(options)
}
