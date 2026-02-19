import { describe, it, expect } from 'vitest'
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  NETWORK,
  FEE_POST_MESSAGE,
  FEE_PIN_24HR,
  FEE_PIN_72HR,
  FEE_REACTION,
  PIN_24HR_BLOCKS,
  PIN_72HR_BLOCKS,
  MIN_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
} from '../../utils/constants'

describe('constants', () => {
  it('exports a valid contract address', () => {
    expect(CONTRACT_ADDRESS).toMatch(/^SP[A-Z0-9]+$/)
  })

  it('exports a contract name', () => {
    expect(CONTRACT_NAME).toBe('message-board-v4')
  })

  it('exports a valid network', () => {
    expect(['mainnet', 'testnet']).toContain(NETWORK)
  })

  it('fees are positive integers', () => {
    expect(FEE_POST_MESSAGE).toBeGreaterThan(0)
    expect(FEE_PIN_24HR).toBeGreaterThan(0)
    expect(FEE_PIN_72HR).toBeGreaterThan(0)
    expect(FEE_REACTION).toBeGreaterThan(0)
  })

  it('72hr pin costs more than 24hr', () => {
    expect(FEE_PIN_72HR).toBeGreaterThan(FEE_PIN_24HR)
  })

  it('pin blocks are reasonable', () => {
    expect(PIN_24HR_BLOCKS).toBe(144)
    expect(PIN_72HR_BLOCKS).toBe(432)
  })

  it('message length constraints are valid', () => {
    expect(MIN_MESSAGE_LENGTH).toBe(1)
    expect(MAX_MESSAGE_LENGTH).toBe(280)
    expect(MAX_MESSAGE_LENGTH).toBeGreaterThan(MIN_MESSAGE_LENGTH)
  })
})
