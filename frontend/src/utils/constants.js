// MAINNET CONFIGURATION - BitChat v3
// Deployed: February 8, 2026
// Explorer: https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4?chain=mainnet

// Contract deployment details
export const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193'
export const CONTRACT_NAME = 'message-board-v4'

// Network configuration
export const NETWORK = 'mainnet'

// Fee constants (in microSTX) - MUST match contract
export const FEE_POST_MESSAGE = 10000        // 0.00001 STX
export const FEE_PIN_24HR = 50000            // 0.00005 STX
export const FEE_PIN_72HR = 100000           // 0.0001 STX
export const FEE_REACTION = 5000             // 0.000005 STX

// Block durations
export const PIN_24HR_BLOCKS = 144
export const PIN_72HR_BLOCKS = 432

// Message constraints
export const MIN_MESSAGE_LENGTH = 1
export const MAX_MESSAGE_LENGTH = 280

// Mainnet Explorer URL
export const EXPLORER_URL = 'https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4?chain=mainnet'
