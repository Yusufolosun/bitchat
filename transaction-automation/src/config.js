// =============================================================================
// Configuration Module - BitChat Transaction Automation
// =============================================================================

import dotenv from 'dotenv';
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';

// Load environment variables
dotenv.config();

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

function validateRequired(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validatePositiveNumber(name, value, defaultValue) {
  const num = parseInt(value) || defaultValue;
  if (num <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return num;
}

function validateContractAddress(address) {
  // Stacks mainnet addresses start with SP, testnet with ST
  if (!address.match(/^S[TP][0-9A-Z]+$/)) {
    throw new Error(`Invalid contract address format: ${address}`);
  }
  return address;
}

// =============================================================================
// NETWORK CONFIGURATION
// =============================================================================

function getNetwork() {
  const networkType = process.env.NETWORK || 'mainnet';
  const customUrl = process.env.STACKS_API_URL;

  switch (networkType.toLowerCase()) {
    case 'mainnet':
      return customUrl ? new StacksMainnet({ url: customUrl }) : new StacksMainnet();
    case 'testnet':
      return customUrl ? new StacksTestnet({ url: customUrl }) : new StacksTestnet();
    case 'devnet':
      return customUrl ? new StacksDevnet({ url: customUrl }) : new StacksDevnet();
    default:
      throw new Error(`Invalid network type: ${networkType}. Use: mainnet, testnet, or devnet`);
  }
}

// =============================================================================
// CONTRACT CONFIGURATION
// =============================================================================

export const CONTRACT_CONFIG = {
  address: validateContractAddress(
    validateRequired('CONTRACT_ADDRESS', process.env.CONTRACT_ADDRESS)
  ),
  name: validateRequired('CONTRACT_NAME', process.env.CONTRACT_NAME),
  
  // Fee constants (in microSTX) - must match contract
  fees: {
    postMessage: 10000,      // 0.00001 STX
    pin24Hr: 50000,          // 0.00005 STX
    pin72Hr: 100000,         // 0.0001 STX
    reaction: 5000,          // 0.000005 STX
  },
  
  // Block durations
  pinDurations: {
    '24hr': 144,
    '72hr': 432,
  },
  
  // Message constraints
  messageLength: {
    min: 1,
    max: 280,
  }
};

// =============================================================================
// WALLET CONFIGURATION
// =============================================================================

export const WALLET_CONFIG = {
  // User must provide EITHER mnemonic OR private key
  mnemonic: process.env.MNEMONIC,
  privateKey: process.env.PRIVATE_KEY,
  accountIndex: parseInt(process.env.ACCOUNT_INDEX) || 0,
};

// Validate wallet credentials
if (!WALLET_CONFIG.mnemonic && !WALLET_CONFIG.privateKey) {
  throw new Error(
    'Missing wallet credentials! Provide either MNEMONIC or PRIVATE_KEY in .env file'
  );
}

if (WALLET_CONFIG.mnemonic && WALLET_CONFIG.privateKey) {
  console.warn(
    '⚠️  Warning: Both MNEMONIC and PRIVATE_KEY provided. Using MNEMONIC (ignoring PRIVATE_KEY)'
  );
}

// =============================================================================
// FUNCTION CONFIGURATION
// =============================================================================

export const FUNCTION_CONFIG = {
  name: validateRequired('FUNCTION_NAME', process.env.FUNCTION_NAME),
  
  // For post-message
  messageTemplate: process.env.MESSAGE_TEMPLATE || 'Automated test message #{number}',
  
  // For pin-message
  pinMessageIds: process.env.PIN_MESSAGE_IDS 
    ? process.env.PIN_MESSAGE_IDS.split(',').map(id => parseInt(id.trim()))
    : [],
  pinDuration: parseInt(process.env.PIN_DURATION) || 144,
  
  // For react-to-message
  reactMessageIds: process.env.REACT_MESSAGE_IDS
    ? process.env.REACT_MESSAGE_IDS.split(',').map(id => parseInt(id.trim()))
    : [],
};

// Validate function name
const validFunctions = ['post-message', 'pin-message', 'react-to-message'];
if (!validFunctions.includes(FUNCTION_CONFIG.name)) {
  throw new Error(
    `Invalid FUNCTION_NAME: ${FUNCTION_CONFIG.name}. Must be one of: ${validFunctions.join(', ')}`
  );
}

// Validate function-specific requirements
if (FUNCTION_CONFIG.name === 'pin-message') {
  if (FUNCTION_CONFIG.pinMessageIds.length === 0) {
    throw new Error('PIN_MESSAGE_IDS required for pin-message function');
  }
  if (![144, 432].includes(FUNCTION_CONFIG.pinDuration)) {
    throw new Error('PIN_DURATION must be 144 (24hr) or 432 (72hr)');
  }
}

if (FUNCTION_CONFIG.name === 'react-to-message') {
  if (FUNCTION_CONFIG.reactMessageIds.length === 0) {
    throw new Error('REACT_MESSAGE_IDS required for react-to-message function');
  }
}

// =============================================================================
// TRANSACTION SETTINGS
// =============================================================================

export const TRANSACTION_CONFIG = {
  total: validatePositiveNumber('TOTAL_TRANSACTIONS', process.env.TOTAL_TRANSACTIONS, 40),
  maxBudgetSTX: parseFloat(process.env.MAX_BUDGET_STX) || 2.5,
  delaySeconds: validatePositiveNumber('DELAY_BETWEEN_TX', process.env.DELAY_BETWEEN_TX, 5),
  customFee: process.env.CUSTOM_FEE ? parseInt(process.env.CUSTOM_FEE) : null,
  dryRun: process.env.DRY_RUN === 'true',
};

// Validate budget
const maxBudgetMicroSTX = TRANSACTION_CONFIG.maxBudgetSTX * 1_000_000;
console.log(`💰 Budget: ${TRANSACTION_CONFIG.maxBudgetSTX} STX (${maxBudgetMicroSTX} microSTX)`);

// =============================================================================
// NETWORK SETTINGS
// =============================================================================

export const NETWORK_CONFIG = {
  network: getNetwork(),
  networkType: process.env.NETWORK || 'mainnet',
  apiUrl: process.env.STACKS_API_URL || getNetwork().coreApiUrl,
};

// =============================================================================
// LOGGING CONFIGURATION
// =============================================================================

export const LOG_CONFIG = {
  verbose: process.env.VERBOSE === 'true',
  logDir: './logs',
  logFile: `transaction-log-${Date.now()}.json`,
};

// =============================================================================
// EXPORT SUMMARY
// =============================================================================

export function printConfiguration() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 BITCHAT TRANSACTION AUTOMATION - CONFIGURATION');
  console.log('='.repeat(70));
  
  console.log('\n📝 CONTRACT:');
  console.log(`   Address: ${CONTRACT_CONFIG.address}`);
  console.log(`   Name: ${CONTRACT_CONFIG.name}`);
  console.log(`   Network: ${NETWORK_CONFIG.networkType}`);
  
  console.log('\n⚙️  FUNCTION:');
  console.log(`   Function: ${FUNCTION_CONFIG.name}`);
  
  if (FUNCTION_CONFIG.name === 'post-message') {
    console.log(`   Template: "${FUNCTION_CONFIG.messageTemplate}"`);
  } else if (FUNCTION_CONFIG.name === 'pin-message') {
    console.log(`   Message IDs: ${FUNCTION_CONFIG.pinMessageIds.slice(0, 5).join(', ')}${FUNCTION_CONFIG.pinMessageIds.length > 5 ? '...' : ''}`);
    console.log(`   Duration: ${FUNCTION_CONFIG.pinDuration} blocks`);
  } else if (FUNCTION_CONFIG.name === 'react-to-message') {
    console.log(`   Message IDs: ${FUNCTION_CONFIG.reactMessageIds.slice(0, 5).join(', ')}${FUNCTION_CONFIG.reactMessageIds.length > 5 ? '...' : ''}`);
  }
  
  console.log('\n💼 WALLET:');
  console.log(`   Type: ${WALLET_CONFIG.mnemonic ? 'Mnemonic' : 'Private Key'}`);
  if (WALLET_CONFIG.mnemonic) {
    console.log(`   Account Index: ${WALLET_CONFIG.accountIndex}`);
  }
  
  console.log('\n📊 TRANSACTION SETTINGS:');
  console.log(`   Total TXs: ${TRANSACTION_CONFIG.total}`);
  console.log(`   Max Budget: ${TRANSACTION_CONFIG.maxBudgetSTX} STX`);
  console.log(`   Delay: ${TRANSACTION_CONFIG.delaySeconds}s between TXs`);
  console.log(`   Dry Run: ${TRANSACTION_CONFIG.dryRun ? 'YES (simulation only)' : 'NO (real transactions)'}`);
  
  console.log('\n' + '='.repeat(70) + '\n');
}

// Default export
export default {
  CONTRACT_CONFIG,
  WALLET_CONFIG,
  FUNCTION_CONFIG,
  TRANSACTION_CONFIG,
  NETWORK_CONFIG,
  LOG_CONFIG,
  printConfiguration,
};
