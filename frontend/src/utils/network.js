import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network'
import { NETWORK } from './constants'

export const getNetwork = () => {
  return NETWORK === 'mainnet' 
    ? STACKS_MAINNET 
    : STACKS_TESTNET
}

export const getExplorerUrl = (txId) => {
  const baseUrl = NETWORK === 'mainnet'
    ? 'https://explorer.hiro.so/txid'
    : 'https://explorer.hiro.so/txid'
  return `${baseUrl}/${txId}?chain=${NETWORK}`
}
