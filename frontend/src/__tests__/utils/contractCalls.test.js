import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @stacks/connect
vi.mock('@stacks/connect', () => ({
  openContractCall: vi.fn(),
}))

// Mock @stacks/transactions
vi.mock('@stacks/transactions', () => ({
  uintCV: vi.fn((n) => ({ type: 'uint', value: n })),
  stringUtf8CV: vi.fn((s) => ({ type: 'string-utf8', value: s })),
  PostConditionMode: { Deny: 2 },
  makeStandardSTXPostCondition: vi.fn((addr, code, amount) => ({
    type: 'stx-postcondition',
    address: addr,
    conditionCode: code,
    amount,
  })),
  FungibleConditionCode: { Equal: 1 },
}))

// Mock network
vi.mock('../../utils/network', () => ({
  getNetwork: vi.fn(() => ({ url: 'https://api.hiro.so' })),
}))

import { openContractCall } from '@stacks/connect'
import { stringUtf8CV, uintCV } from '@stacks/transactions'
import { postMessage, pinMessage, reactToMessage } from '../../utils/contractCalls'
import { CONTRACT_ADDRESS, CONTRACT_NAME, FEE_POST_MESSAGE, FEE_PIN_24HR, FEE_PIN_72HR, FEE_REACTION } from '../../utils/constants'

describe('postMessage', () => {
  beforeEach(() => {
    openContractCall.mockReset()
  })

  it('calls openContractCall with correct function name', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'tx_post_123' })
    })

    await postMessage('Hello!', 'SP_SENDER')

    expect(openContractCall).toHaveBeenCalledOnce()
    const args = openContractCall.mock.calls[0][0]
    expect(args.contractAddress).toBe(CONTRACT_ADDRESS)
    expect(args.contractName).toBe(CONTRACT_NAME)
    expect(args.functionName).toBe('post-message')
  })

  it('passes message content as string-utf8 argument', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'tx1' })
    })

    await postMessage('Hello world', 'SP_SENDER')

    expect(stringUtf8CV).toHaveBeenCalledWith('Hello world')
  })

  it('returns the transaction ID', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'tx_abc' })
    })

    const txId = await postMessage('Test', 'SP_SENDER')
    expect(txId).toBe('tx_abc')
  })

  it('rejects with UserRejected when cancelled', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onCancel()
    })

    await expect(postMessage('Test', 'SP_SENDER')).rejects.toThrow('UserRejected')
  })

  it('uses PostConditionMode.Deny', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'tx1' })
    })

    await postMessage('Test', 'SP_SENDER')

    const args = openContractCall.mock.calls[0][0]
    expect(args.postConditionMode).toBe(2) // PostConditionMode.Deny
  })

  it('includes STX post condition with correct fee', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'tx1' })
    })

    await postMessage('Test', 'SP_SENDER')

    const args = openContractCall.mock.calls[0][0]
    expect(args.postConditions).toHaveLength(1)
    expect(args.postConditions[0].amount).toBe(FEE_POST_MESSAGE)
    expect(args.postConditions[0].address).toBe('SP_SENDER')
  })
})

describe('pinMessage', () => {
  beforeEach(() => {
    openContractCall.mockReset()
  })

  it('calls pin-message with correct args for 24hr', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'pin_tx' })
    })

    await pinMessage(5, true, 'SP_SENDER')

    const args = openContractCall.mock.calls[0][0]
    expect(args.functionName).toBe('pin-message')
    expect(uintCV).toHaveBeenCalledWith(5) // message ID
    expect(uintCV).toHaveBeenCalledWith(144) // 24hr blocks
    expect(args.postConditions[0].amount).toBe(FEE_PIN_24HR)
  })

  it('uses 72hr duration and fee when duration24hr is false', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'pin_tx' })
    })

    await pinMessage(5, false, 'SP_SENDER')

    const args = openContractCall.mock.calls[0][0]
    expect(uintCV).toHaveBeenCalledWith(432) // 72hr blocks
    expect(args.postConditions[0].amount).toBe(FEE_PIN_72HR)
  })

  it('returns tx ID on success', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'pin_ok' })
    })

    const txId = await pinMessage(1, true, 'SP_SENDER')
    expect(txId).toBe('pin_ok')
  })
})

describe('reactToMessage', () => {
  beforeEach(() => {
    openContractCall.mockReset()
  })

  it('calls react-to-message with message ID', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'react_tx' })
    })

    await reactToMessage(10, 'SP_SENDER')

    const args = openContractCall.mock.calls[0][0]
    expect(args.functionName).toBe('react-to-message')
    expect(uintCV).toHaveBeenCalledWith(10)
  })

  it('uses reaction fee in post condition', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'react_tx' })
    })

    await reactToMessage(10, 'SP_SENDER')

    const args = openContractCall.mock.calls[0][0]
    expect(args.postConditions[0].amount).toBe(FEE_REACTION)
  })

  it('returns tx ID', async () => {
    openContractCall.mockImplementation(async (opts) => {
      opts.onFinish({ txId: 'react_ok' })
    })

    const txId = await reactToMessage(10, 'SP_SENDER')
    expect(txId).toBe('react_ok')
  })
})
