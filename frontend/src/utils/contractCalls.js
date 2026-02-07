import { openContractCall } from '@stacks/connect'
import {
  uintCV,
  stringUtf8CV,
  PostConditionMode,
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

export const postMessage = async (content, userSession) => {
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
    postConditionMode: PostConditionMode.Allow,
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

export const pinMessage = async (messageId, duration24hr, userSession) => {
  const network = getNetwork()
  const durationBlocks = duration24hr ? PIN_24HR_BLOCKS : PIN_72HR_BLOCKS
  
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
    postConditionMode: PostConditionMode.Allow,
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

// TO BE CONTINUED - will add react function
