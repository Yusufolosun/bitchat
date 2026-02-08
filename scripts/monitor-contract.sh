#!/bin/bash

# Contract Monitoring Script
# Monitors mainnet contract for activity and health

CONTRACT_ADDRESS="$1"

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "Usage: ./monitor-contract.sh <contract-address>"
    exit 1
fi

echo "🔍 Monitoring contract: $CONTRACT_ADDRESS"
echo "========================================"
echo ""

# Function to check contract status
check_status() {
    echo "📊 Contract Status Check - $(date)"
    echo "-----------------------------------"
    
    # Get total messages (example - adjust based on your contract)
    stx call-read-only "$CONTRACT_ADDRESS" message-board get-total-messages \
        --mainnet 2>/dev/null || echo "  Total Messages: Unable to fetch"
    
    # Get total fees
    stx call-read-only "$CONTRACT_ADDRESS" message-board get-total-fees-collected \
        --mainnet 2>/dev/null || echo "  Total Fees: Unable to fetch"
    
    # Get pause status
    stx call-read-only "$CONTRACT_ADDRESS" message-board is-contract-paused \
        --mainnet 2>/dev/null || echo "  Pause Status: Unable to fetch"
    
    echo ""
}

# Monitor loop
echo "Press Ctrl+C to stop monitoring"
echo ""

while true; do
    check_status
    sleep 300  # Check every 5 minutes
done
