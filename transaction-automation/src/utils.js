import { makeSTXTokenTransfer, makeContractCall, AnchorMode, broadcastTransaction, getNonce } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import fs from 'fs/promises';
import path from 'path';

/**
 * Get account nonce from Stacks API
 */
export async function getAccountNonce(address, network) {
  const url = `${network.coreApiUrl}/v2/accounts/${address}?proof=0`;
  const response = await fetch(url);
  const data = await response.json();
  return data.nonce;
}

/**
 * Check account balance
 */
export async function checkBalance(address, network) {
  const url = `${network.coreApiUrl}/v2/accounts/${address}?proof=0`;
  const response = await fetch(url);
  const data = await response.json();
  return parseInt(data.balance) / 1000000; // Convert to STX
}

/**
 * Estimate transaction fee
 */
export async function estimateFee(transaction, network) {
  try {
    const url = `${network.coreApiUrl}/v2/fees/transaction`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: transaction.serialize().toString('hex') })
    });
    const data = await response.json();
    return data.estimations?.[0]?.fee || 1000; // Fallback to 1000 microSTX
  } catch (error) {
    console.warn('⚠️  Fee estimation failed, using default');
    return 1000;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(txId, network, timeout = 300000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.tx_status === 'success') {
        return { success: true, data };
      }
      if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
        return { success: false, error: data.tx_status };
      }
    } catch (error) {
      // Transaction not found yet, continue waiting
    }
    await sleep(5000); // Check every 5 seconds
  }
  return { success: false, error: 'timeout' };
}

/**
 * Sleep utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Save transaction log
 */
export async function saveTransactionLog(transactions) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `logs/transactions-${timestamp}.json`;
  
  await fs.mkdir('logs', { recursive: true });
  await fs.writeFile(
    filename,
    JSON.stringify(transactions, null, 2)
  );
  
  console.log(`\n💾 Transaction log saved: ${filename}`);
  return filename;
}

/**
 * Format STX amount
 */
export function formatSTX(microSTX) {
  return (microSTX / 1000000).toFixed(6);
}

/**
 * Generate message content based on template
 */
export function generateMessage(template, index) {
  return template.replace('#{number}', index + 1);
}

/**
 * Get explorer link
 */
export function getExplorerLink(txId, network) {
  const baseUrl = network instanceof StacksMainnet
    ? 'https://explorer.hiro.so/txid'
    : 'https://explorer.hiro.so/txid';
  const chain = network instanceof StacksMainnet ? 'mainnet' : 'testnet';
  return `${baseUrl}/${txId}?chain=${chain}`;
}
