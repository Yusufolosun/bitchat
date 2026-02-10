import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';

// ANSI color codes
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
 * Get transaction status from Stacks API
 */
async function getTransactionStatus(txId, network) {
  try {
    const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return { status: 'not_found', error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    return {
      status: data.tx_status,
      blockHeight: data.block_height,
      blockHash: data.block_hash,
      fee: data.fee_rate,
      result: data.tx_result
    };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

/**
 * Find the most recent transaction log file
 */
async function findLatestLogFile() {
  try {
    const files = await fs.readdir('logs');
    const jsonFiles = files.filter(f => f.startsWith('transactions-') && f.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      return null;
    }
    
    // Sort by filename (which includes timestamp) and get the latest
    jsonFiles.sort().reverse();
    return path.join('logs', jsonFiles[0]);
  } catch (error) {
    return null;
  }
}

/**
 * Format transaction status for display
 */
function formatStatus(status) {
  switch (status) {
    case 'success':
      return `${colors.green}✅ SUCCESS${colors.reset}`;
    case 'pending':
      return `${colors.yellow}⏳ PENDING${colors.reset}`;
    case 'abort_by_response':
    case 'abort_by_post_condition':
      return `${colors.red}❌ ABORTED${colors.reset}`;
    case 'not_found':
      return `${colors.yellow}🔍 NOT FOUND${colors.reset}`;
    default:
      return `${colors.magenta}${status.toUpperCase()}${colors.reset}`;
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}========================================`);
  console.log(`TRANSACTION VERIFICATION${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
  
  try {
    // Find log file
    console.log(`${colors.blue}📂 Looking for transaction log...${colors.reset}`);
    const logFile = await findLatestLogFile();
    
    if (!logFile) {
      console.log(`${colors.red}❌ No transaction logs found in logs/ directory${colors.reset}`);
      console.log(`${colors.yellow}💡 Run transactions first: npm start${colors.reset}\n`);
      process.exit(1);
    }
    
    console.log(`${colors.green}✅ Found log: ${logFile}${colors.reset}\n`);
    
    // Load transaction log
    const logContent = await fs.readFile(logFile, 'utf-8');
    const log = JSON.parse(logContent);
    
    // Display summary
    console.log(`${colors.bright}EXECUTION SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}`);
    console.log(`Contract: ${log.summary.contractAddress}.${log.summary.contractName}`);
    console.log(`Function: ${log.summary.functionName}`);
    console.log(`Network: ${log.summary.network}`);
    console.log(`Mode: ${log.summary.mode}`);
    console.log(`Total: ${log.summary.total} transactions`);
    console.log(`Successful: ${colors.green}${log.summary.successful}${colors.reset}`);
    console.log(`Failed: ${colors.red}${log.summary.failed}${colors.reset}`);
    console.log(`Executed: ${log.summary.startTime}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);
    
    // If dry-run, no need to verify
    if (log.summary.mode === 'dry-run') {
      console.log(`${colors.yellow}ℹ️  This was a dry-run - no transactions were broadcasted${colors.reset}\n`);
      process.exit(0);
    }
    
    // Verify each transaction
    console.log(`${colors.bright}TRANSACTION STATUS${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);
    
    const broadcastedTxs = log.transactions.filter(tx => tx.status === 'broadcasted');
    
    if (broadcastedTxs.length === 0) {
      console.log(`${colors.yellow}ℹ️  No successful broadcasts to verify${colors.reset}\n`);
      process.exit(0);
    }
    
    console.log(`${colors.blue}🔍 Checking ${broadcastedTxs.length} transactions...${colors.reset}\n`);
    
    let confirmed = 0;
    let pending = 0;
    let failed = 0;
    let notFound = 0;
    
    for (const tx of broadcastedTxs) {
      const status = await getTransactionStatus(tx.txId, config.network);
      
      console.log(`${colors.bright}[${tx.index}/${log.summary.total}]${colors.reset} ${formatStatus(status.status)}`);
      console.log(`   TxID: ${colors.cyan}${tx.txId}${colors.reset}`);
      
      if (status.blockHeight) {
        console.log(`   Block: ${status.blockHeight}`);
      }
      
      if (status.result) {
        console.log(`   Result: ${status.result.repr || status.result}`);
      }
      
      if (status.error) {
        console.log(`   ${colors.yellow}Error: ${status.error}${colors.reset}`);
      }
      
      console.log(`   Explorer: ${tx.explorerLink}`);
      console.log();
      
      // Count statuses
      switch (status.status) {
        case 'success':
          confirmed++;
          break;
        case 'pending':
          pending++;
          break;
        case 'not_found':
          notFound++;
          break;
        default:
          failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final summary
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.bright}VERIFICATION SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.green}✅ Confirmed: ${confirmed}${colors.reset}`);
    console.log(`${colors.yellow}⏳ Pending: ${pending}${colors.reset}`);
    console.log(`${colors.red}❌ Failed/Aborted: ${failed}${colors.reset}`);
    console.log(`${colors.magenta}🔍 Not Found: ${notFound}${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}\n`);
    
    if (pending > 0) {
      console.log(`${colors.yellow}💡 Some transactions are still pending - check again in a few minutes${colors.reset}`);
      console.log(`${colors.yellow}💡 Run: npm run verify${colors.reset}\n`);
    }
    
    if (confirmed === broadcastedTxs.length) {
      console.log(`${colors.green}${colors.bright}🎉 All transactions confirmed successfully!${colors.reset}\n`);
    }
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ ERROR${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Execute
main();
