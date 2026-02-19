import dotenv from 'dotenv';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

dotenv.config();

// Validate required environment variables
const requiredVars = ['CONTRACT_ADDRESS', 'CONTRACT_NAME', 'FUNCTION_NAME', 'TOTAL_TRANSACTIONS', 'MAX_BUDGET_STX'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('   Please copy .env.example to .env and configure it');
  process.exit(1);
}

// Validate wallet credentials
if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
  console.error('❌ Must provide either PRIVATE_KEY or MNEMONIC in .env');
  process.exit(1);
}

export const config = {
  // Wallet
  privateKey: process.env.PRIVATE_KEY,
  mnemonic: process.env.MNEMONIC,
  
  // Contract
  contractAddress: process.env.CONTRACT_ADDRESS,
  contractName: process.env.CONTRACT_NAME,
  
  // Function
  functionName: process.env.FUNCTION_NAME,
  messageTemplate: process.env.MESSAGE_TEMPLATE || 'Automated message #{number}',
  pinMessageIds: process.env.PIN_MESSAGE_IDS?.split(',').map(id => parseInt(id.trim())),
  pinDuration: parseInt(process.env.PIN_DURATION || '144'),
  reactMessageIds: process.env.REACT_MESSAGE_IDS?.split(',').map(id => parseInt(id.trim())),
  
  // Transaction settings
  totalTransactions: parseInt(process.env.TOTAL_TRANSACTIONS),
  maxBudgetSTX: parseFloat(process.env.MAX_BUDGET_STX),
  delayBetweenTx: parseInt(process.env.DELAY_BETWEEN_TX || '3') * 1000, // Convert to ms
  
  // Network
  network: process.env.NETWORK === 'testnet' ? new StacksTestnet() : new StacksMainnet(),
  stacksApiUrl: process.env.STACKS_API_URL || 'https://api.mainnet.hiro.so',
  
  // Advanced
  feeMultiplier: parseFloat(process.env.FEE_MULTIPLIER || '1.2'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.RETRY_DELAY || '5') * 1000,
  
  // Flags
  dryRun: process.env.DRY_RUN === 'true'
};

// Validation
if (config.functionName === 'pin-message' && !config.pinMessageIds) {
  console.error('❌ PIN_MESSAGE_IDS required for pin-message function');
  process.exit(1);
}

if (config.functionName === 'react-to-message' && !config.reactMessageIds) {
  console.error('❌ REACT_MESSAGE_IDS required for react-to-message function');
  process.exit(1);
}

// Calculate per-transaction budget
config.maxFeePerTx = (config.maxBudgetSTX / config.totalTransactions) * 1000000; // Convert to microSTX

console.log('✅ Configuration loaded successfully');
console.log(`   Mode: ${config.dryRun ? 'DRY RUN (no transactions will be broadcast)' : 'LIVE'}`);
console.log(`   Target: ${config.contractAddress}.${config.contractName}`);
console.log(`   Function: ${config.functionName}`);
console.log(`   Transactions: ${config.totalTransactions}`);
console.log(`   Max budget: ${config.maxBudgetSTX} STX (~${(config.maxFeePerTx / 1000000).toFixed(6)} STX per tx)`);
