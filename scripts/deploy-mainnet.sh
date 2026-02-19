#!/bin/bash

# Mainnet Deployment Script for BitChat v4
# Execute with caution - this deploys to MAINNET

set -e  # Exit on error

echo "🚀 BitChat v4 Mainnet Deployment Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."

echo -n "Checking Clarinet installation... "
if ! command -v clarinet &> /dev/null; then
    echo -e "${RED}FAILED${NC}"
    echo "Error: Clarinet is not installed"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

echo -n "Running contract validation... "
if ! clarinet check &> /dev/null; then
    echo -e "${RED}FAILED${NC}"
    echo "Error: Contract validation failed"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

echo -n "Running tests... "
if ! npm test &> /dev/null; then
    echo -e "${RED}FAILED${NC}"
    echo "Error: Tests failed"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

# Confirmation prompt
echo ""
echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to MAINNET${NC}"
echo "This will use REAL STX and the contract will be IMMUTABLE"
echo ""
read -p "Are you sure you want to proceed? (type 'YES' to confirm): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Generate deployment plan
echo ""
echo "📝 Generating mainnet deployment plan..."
clarinet deployments generate --mainnet

# Show plan
echo ""
echo "Deployment plan generated. Review it carefully."
echo ""
read -p "Press Enter to continue with deployment..."

# Apply deployment
echo ""
echo "🚀 Deploying to mainnet..."
clarinet deployments apply --mainnet

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Verify contract on Stacks Explorer"
echo "2. Record contract address"
echo "3. Update frontend constants"
echo "4. Test initial transactions"
echo "5. Monitor for 24 hours"
echo ""
echo "Contract explorer URL:"
echo "https://explorer.hiro.so/?chain=mainnet"
