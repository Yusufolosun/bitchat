// Type declarations for Clarinet testing environment

import type { ClarityValue } from "@stacks/transactions";
import "vitest";

declare global {
  const simnet: {
    blockHeight: number;
    getAccounts(): Map<string, string>;
    callPublicFn(
      contract: string,
      method: string,
      args: ClarityValue[],
      sender: string
    ): { result: any };
    callReadOnlyFn(
      contract: string,
      method: string,
      args: ClarityValue[],
      sender: string
    ): { result: any };
    getAssetsMap(): Map<string, Map<string, number>>;
    mineEmptyBlocks(count: number): void;
  };
}

declare module "vitest" {
  interface Assertion<T = any> {
    toBeOk(expected?: ClarityValue): void;
    toBeErr(expected?: ClarityValue): void;
    toBeSome(expected?: ClarityValue): void;
    toBeNone(): void;
    toBeBool(expected: boolean): void;
    toBeInt(expected: bigint | number): void;
    toBeUint(expected: bigint | number): void;
  }

  interface AsymmetricMatchersContaining {
    toBeOk(expected?: ClarityValue): void;
    toBeErr(expected?: ClarityValue): void;
    toBeSome(expected?: ClarityValue): void;
    toBeNone(): void;
    toBeBool(expected: boolean): void;
    toBeInt(expected: bigint | number): void;
    toBeUint(expected: bigint | number): void;
  }
}

export {};
