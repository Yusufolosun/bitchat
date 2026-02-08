// TESTNET CONFIGURATION - BitChat v3
// Deployed: February 8, 2026
// Explorer: https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet

// Contract deployment details
export const CONTRACT_ADDRESS = 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0'
export const CONTRACT_NAME = 'message-board-v3'

// Network configuration
export const NETWORK = 'testnet'

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

// Testnet Explorer URL
export const EXPLORER_URL = 'https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet'
