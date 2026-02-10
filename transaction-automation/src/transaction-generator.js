import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringUtf8CV,
  uintCV,
  PostConditionMode,
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';
import * as bip39 from 'bip39';
import { config } from './config.js';
import { 
  getAccountNonce, 
  checkBalance, 
  estimateFee, 
  sleep, 
  saveTransactionLog, 
  formatSTX,
  generateMessage,
  getExplorerLink
} from './utils.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * Get private key from mnemonic or environment variable
 */
async function getPrivateKey() {
  if (config.privateKey) {
    return config.privateKey;
  }
  
  if (config.mnemonic) {
    // Validate mnemonic
    if (!bip39.validateMnemonic(config.mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    
    // Generate wallet from mnemonic
    const wallet = await generateWallet({
      secretKey: config.mnemonic,
      password: ''
    });
    
    // Get the first account's private key (Stacks wallet uses account index 0)
    const account = wallet.accounts[0];
    return account.stxPrivateKey;
  }
  
  throw new Error('No private key or mnemonic provided');
}

/**
 * Build function arguments based on function name
 */
function buildFunctionArgs(functionName, index) {
  switch (functionName) {
    case 'post-message':
      const message = generateMessage(config.messageTemplate, index);
      return [stringUtf8CV(message)];
      
    case 'pin-message':
      if (!config.pinMessageIds || index >= config.pinMessageIds.length) {
        throw new Error(`No message ID available for transaction ${index + 1}`);
      }
      return [
        uintCV(config.pinMessageIds[index]),
        uintCV(config.pinDuration)
      ];
      
    case 'react-to-message':
      if (!config.reactMessageIds || index >= config.reactMessageIds.length) {
        throw new Error(`No message ID available for transaction ${index + 1}`);
      }
      return [uintCV(config.reactMessageIds[index])];
      
    default:
      throw new Error(`Unsupported function: ${functionName}`);
  }
}

/**
 * Create and broadcast a single transaction
 */
async function sendTransaction(privateKey, senderAddress, nonce, index) {
  const functionArgs = buildFunctionArgs(config.functionName, index);
  
  // Create transaction options
  const txOptions = {
    contractAddress: config.contractAddress,
    contractName: config.contractName,
    functionName: config.functionName,
    functionArgs: functionArgs,
    senderKey: privateKey,
    network: config.network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(Math.floor(config.maxFeePerTx)) // Convert to BigInt
  };
  
  // Create transaction
  const transaction = await makeContractCall(txOptions);
  
  // Estimate fee if not in dry-run mode
  if (!config.dryRun) {
    try {
      const estimatedFee = await estimateFee(transaction, config.network);
      const adjustedFee = Math.floor(estimatedFee * config.feeMultiplier);
      
      // Ensure fee doesn't exceed max budget
      if (adjustedFee <= config.maxFeePerTx) {
        txOptions.fee = BigInt(adjustedFee);
        // Recreate transaction with adjusted fee
        const newTransaction = await makeContractCall(txOptions);
        return newTransaction;
      }
    } catch (error) {
      console.warn(`${colors.yellow}⚠️  Fee estimation failed for tx ${index + 1}, using max fee${colors.reset}`);
    }
  }
  
  return transaction;
}

/**
 * Broadcast transaction with retry logic
 */
async function broadcastWithRetry(transaction, index, maxRetries = config.maxRetries) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await broadcastTransaction(transaction, config.network);
      
      if (result.error) {
        lastError = result;
        if (attempt < maxRetries) {
          console.log(`${colors.yellow}   ⚠️  Attempt ${attempt} failed: ${result.error}${colors.reset}`);
          console.log(`${colors.yellow}   ⏳ Retrying in ${config.retryDelay / 1000}s...${colors.reset}`);
          await sleep(config.retryDelay);
          continue;
        }
      } else {
        return { success: true, txId: result.txid || result };
      }
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`${colors.yellow}   ⚠️  Attempt ${attempt} failed: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}   ⏳ Retrying in ${config.retryDelay / 1000}s...${colors.reset}`);
        await sleep(config.retryDelay);
        continue;
      }
    }
  }
  
  return { 
    success: false, 
    error: lastError?.error || lastError?.message || 'Unknown error' 
  };
}

/**
 * Main execution function
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}========================================`);
  console.log(`BITCHAT TRANSACTION AUTOMATION${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
  
  const startTime = Date.now();
  const transactionLog = [];
  
  try {
    // Get private key
    console.log(`${colors.blue}🔐 Deriving wallet credentials...${colors.reset}`);
    const privateKey = await getPrivateKey();
    
    // Derive sender address from private key
    const txVersion = config.network.isMainnet() ? TransactionVersion.Mainnet : TransactionVersion.Testnet;
    const senderAddress = getAddressFromPrivateKey(privateKey, txVersion);
    
    console.log(`${colors.green}✅ Wallet address: ${senderAddress}${colors.reset}\n`);
    
    // Check balance
    console.log(`${colors.blue}💰 Checking account balance...${colors.reset}`);
    const balance = await checkBalance(senderAddress, config.network);
    console.log(`${colors.green}✅ Current balance: ${balance.toFixed(6)} STX${colors.reset}`);
    
    if (balance < config.maxBudgetSTX && !config.dryRun) {
      console.log(`${colors.red}❌ Insufficient balance! Need at least ${config.maxBudgetSTX} STX${colors.reset}`);
      console.log(`${colors.yellow}💡 Top up your wallet or reduce MAX_BUDGET_STX${colors.reset}`);
      process.exit(1);
    }
    
    // Get initial nonce
    console.log(`\n${colors.blue}🔢 Getting account nonce...${colors.reset}`);
    let currentNonce = await getAccountNonce(senderAddress, config.network);
    console.log(`${colors.green}✅ Starting nonce: ${currentNonce}${colors.reset}\n`);
    
    // Confirmation prompt
    if (!config.dryRun) {
      console.log(`${colors.bright}${colors.yellow}⚠️  FINAL WARNING ⚠️${colors.reset}`);
      console.log(`${colors.yellow}This will execute ${config.totalTransactions} REAL transactions on ${config.network.isMainnet() ? 'MAINNET' : 'TESTNET'}${colors.reset}`);
      console.log(`${colors.yellow}Estimated cost: ~${(config.maxBudgetSTX * 0.4).toFixed(4)} - ${(config.maxBudgetSTX * 0.8).toFixed(4)} STX${colors.reset}`);
      console.log(`${colors.yellow}Press Ctrl+C now to cancel, or wait 5 seconds to continue...${colors.reset}\n`);
      await sleep(5000);
    }
    
    // Execute transactions
    console.log(`${colors.bright}${colors.cyan}========================================`);
    console.log(`EXECUTING TRANSACTIONS${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}\n`);
    
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < config.totalTransactions; i++) {
      const txNumber = i + 1;
      const progressBar = `[${txNumber}/${config.totalTransactions}]`;
      
      console.log(`${colors.bright}${progressBar} Transaction ${txNumber}${colors.reset}`);
      
      try {
        // Build transaction
        console.log(`${colors.blue}   📝 Building transaction...${colors.reset}`);
        const transaction = await sendTransaction(privateKey, senderAddress, currentNonce, i);
        
        if (config.dryRun) {
          console.log(`${colors.green}   ✅ DRY RUN: Transaction built successfully${colors.reset}`);
          console.log(`${colors.cyan}   📊 Function: ${config.functionName}${colors.reset}`);
          console.log(`${colors.cyan}   💰 Fee: ${formatSTX(transaction.auth.spendingCondition.fee)} STX${colors.reset}`);
          
          transactionLog.push({
            index: txNumber,
            nonce: currentNonce,
            function: config.functionName,
            fee: formatSTX(transaction.auth.spendingCondition.fee),
            status: 'dry-run',
            timestamp: new Date().toISOString()
          });
          
          successful++;
          currentNonce++;
        } else {
          // Broadcast transaction
          console.log(`${colors.blue}   📡 Broadcasting transaction...${colors.reset}`);
          const result = await broadcastWithRetry(transaction, i);
          
          if (result.success) {
            console.log(`${colors.green}   ✅ Success! TxID: ${result.txId}${colors.reset}`);
            console.log(`${colors.cyan}   🔗 ${getExplorerLink(result.txId, config.network)}${colors.reset}`);
            
            transactionLog.push({
              index: txNumber,
              nonce: currentNonce,
              txId: result.txId,
              function: config.functionName,
              fee: formatSTX(transaction.auth.spendingCondition.fee),
              status: 'broadcasted',
              timestamp: new Date().toISOString(),
              explorerLink: getExplorerLink(result.txId, config.network)
            });
            
            successful++;
            currentNonce++;
          } else {
            console.log(`${colors.red}   ❌ Failed: ${result.error}${colors.reset}`);
            
            transactionLog.push({
              index: txNumber,
              nonce: currentNonce,
              function: config.functionName,
              status: 'failed',
              error: result.error,
              timestamp: new Date().toISOString()
            });
            
            failed++;
            // Still increment nonce to avoid nonce conflicts
            currentNonce++;
          }
        }
        
        // Progress summary
        console.log(`${colors.magenta}   📊 Progress: ${successful} successful, ${failed} failed${colors.reset}`);
        
        // Delay before next transaction (except for last one)
        if (i < config.totalTransactions - 1) {
          const delaySeconds = config.delayBetweenTx / 1000;
          console.log(`${colors.yellow}   ⏳ Waiting ${delaySeconds}s before next transaction...${colors.reset}\n`);
          await sleep(config.delayBetweenTx);
        }
        
      } catch (error) {
        console.log(`${colors.red}   ❌ Error: ${error.message}${colors.reset}\n`);
        
        transactionLog.push({
          index: txNumber,
          nonce: currentNonce,
          function: config.functionName,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        failed++;
        currentNonce++;
      }
    }
    
    // Final summary
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.bright}${colors.cyan}========================================`);
    console.log(`EXECUTION COMPLETE${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}\n`);
    
    console.log(`${colors.green}✅ Successful: ${successful}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.blue}⏱️  Total time: ${totalTime}s${colors.reset}`);
    console.log(`${colors.blue}📊 Average: ${(totalTime / config.totalTransactions).toFixed(2)}s per transaction${colors.reset}\n`);
    
    // Save transaction log
    const logFile = await saveTransactionLog({
      summary: {
        total: config.totalTransactions,
        successful,
        failed,
        totalTimeSeconds: totalTime,
        mode: config.dryRun ? 'dry-run' : 'live',
        network: config.network.isMainnet() ? 'mainnet' : 'testnet',
        contractAddress: config.contractAddress,
        contractName: config.contractName,
        functionName: config.functionName,
        senderAddress,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      },
      transactions: transactionLog
    });
    
    if (!config.dryRun && successful > 0) {
      console.log(`\n${colors.yellow}💡 Transactions may take 10-30 minutes to confirm on-chain${colors.reset}`);
      console.log(`${colors.yellow}💡 Monitor progress at: https://explorer.hiro.so${colors.reset}`);
      console.log(`${colors.yellow}💡 Run verification: npm run verify${colors.reset}\n`);
    }
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ FATAL ERROR${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    console.error(error.stack);
    
    if (transactionLog.length > 0) {
      await saveTransactionLog({
        summary: {
          status: 'aborted',
          error: error.message,
          completedTransactions: transactionLog.length
        },
        transactions: transactionLog
      });
    }
    
    process.exit(1);
  }
}

// Execute
main();
