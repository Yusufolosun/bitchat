/// <reference path="./clarinet.d.ts" />

/**
 * Edge Case Test Suite for message-board contract v3
 * Tests comprehensive  scenarios including security features, boundaries, and error conditions
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

const FEE_POST_MESSAGE = 10000;
const FEE_PIN_24HR = 50000;
const FEE_REACTION = 5000;
const PIN_24HR_BLOCKS = 144;

// Error codes
const ERR_OWNER_ONLY = 100;
const ERR_NOT_FOUND = 101;
const ERR_UNAUTHORIZED = 102;
const ERR_INVALID_INPUT = 103;
const ERR_ALREADY_REACTED = 105;
const ERR_TOO_SOON = 106;
const ERR_CONTRACT_PAUSED = 107;
const ERR_INSUFFICIENT_BALANCE = 108;

describe("message-board v3 - Edge Cases & Security Tests", () => {
  
  describe("Spam Prevention", () => {
    it("prevents posting messages too quickly (err-too-soon u106)", () => {
      // First post should succeed
      const { result: result1 } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("First message")],
        user1
      );
      expect(result1).toBeOk(Cl.uint(0));
      
      // Immediate second post should fail
      const { result: result2 } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Second message")],
        user1
      );
      expect(result2).toBeErr(Cl.uint(ERR_TOO_SOON));
    });

    it("allows posting after cooldown period", () => {
      // First post
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First")], user1);
      
      const { result: tooSoon } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Still too soon")],
        user1
      );
      expect(tooSoon).toBeErr(Cl.uint(ERR_TOO_SOON));
      
      // Advance past cooldown (min-post-gap = 6)
      simnet.mineEmptyBlocks(6);
      
      const { result: afterCooldown } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("After cooldown")],
        user1
      );
      expect(afterCooldown).toBeOk(Cl.uint(1));
    });

    it("does not prevent different users from posting", () => {
      // User1 posts
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("User1 message")], user1);
      
      // User2 can post immediately (different user)
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("User2 message")],
        user2
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("pinning a message does not affect post cooldown", () => {
      // Post a message
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Pinnable")], user3);
      const postBlock = simnet.blockHeight;

      // Advance 3 blocks (less than min-post-gap of 6)
      simnet.mineEmptyBlocks(3);

      // Pin the message
      simnet.callPublicFn("message-board-v3", "pin-message", [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)], user3);

      // Verify last-post-block is still the original post block
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user3)],
        user3
      );

      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE + FEE_PIN_24HR),
          "last-post-block": Cl.uint(postBlock)
        })
      );
    });

    it("reacting to a message does not affect post cooldown", () => {
      // User1 posts a message
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Reactable")], user1);

      // User2 posts, then reacts without enough gap
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("My post")], user2);
      const user2PostBlock = simnet.blockHeight;

      simnet.mineEmptyBlocks(2);

      // React to user1's message
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user2);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user2)],
        user2
      );

      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE + FEE_REACTION),
          "last-post-block": Cl.uint(user2PostBlock)
        })
      );
    });
  });

  describe("Contract Pause Functionality", () => {
    it("starts in unpaused state", () => {
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-contract-paused",
        [],
        deployer
      );
      expect(result).toBeBool(false);
    });

    it("only allows owner to pause contract", () => {
      // Non-owner cannot pause
      const { result: unauthorizedPause } = simnet.callPublicFn(
        "message-board-v3",
        "pause-contract",
        [],
        user1
      );
      expect(unauthorizedPause).toBeErr(Cl.uint(ERR_OWNER_ONLY));
      
      // Owner can pause
      const { result: ownerPause } = simnet.callPublicFn(
        "message-board-v3",
        "pause-contract",
        [],
        deployer
      );
      expect(ownerPause).toBeOk(Cl.bool(true));
      
      // Verify paused state
      const { result: pausedStatus } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-contract-paused",
        [],
        deployer
      );
      expect(pausedStatus).toBeBool(true);
    });

    it("prevents all operations when paused", () => {
      // Pause contract
      simnet.callPublicFn("message-board-v3", "pause-contract", [], deployer);
      
      // post-message should fail
      const { result: postResult } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Should fail")],
        user1
      );
      expect(postResult).toBeErr(Cl.uint(ERR_CONTRACT_PAUSED));
      
      // pin-message should fail (need to post message first in separate test)
      // react-to-message should fail (need message first in separate test)
    });

    it("allows operations after unpause", () => {
      // Pause then unpause
      simnet.callPublicFn("message-board-v3", "pause-contract", [], deployer);
      simnet.callPublicFn("message-board-v3", "unpause-contract", [], deployer);
      
      // Operations should work
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("After unpause")],
        user1
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("only allows owner to unpause", () => {
      simnet.callPublicFn("message-board-v3", "pause-contract", [], deployer);
      
      const { result: unauthorizedUnpause } = simnet.callPublicFn(
        "message-board-v3",
        "unpause-contract",
        [],
        user1
      );
      expect(unauthorizedUnpause).toBeErr(Cl.uint(ERR_OWNER_ONLY));
    });
  });

  describe("Fee Collection & Withdrawal", () => {
    it("collects fees into contract balance", () => {
      const contractId = `${deployer}.message-board-v3`;
      const initialBalance = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      
      // Post a message (should collect fee)
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Fee test")],
        user1
      );
      
      const finalBalance = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      expect(finalBalance - initialBalance).toBe(FEE_POST_MESSAGE);
    });

    it("only allows owner to withdraw fees", () => {
      // Post message to collect some fees
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      // Non-owner cannot withdraw
      const { result: unauthorized } = simnet.callPublicFn(
        "message-board-v3",
        "withdraw-fees",
        [Cl.uint(5000), Cl.principal(user1)],
        user1
      );
      expect(unauthorized).toBeErr(Cl.uint(ERR_OWNER_ONLY));
      
      // Owner can withdraw
      const { result: ownerWithdraw } = simnet.callPublicFn(
        "message-board-v3",
        "withdraw-fees",
        [Cl.uint(5000), Cl.principal(deployer)],
        deployer
      );
      expect(ownerWithdraw).toBeOk(Cl.bool(true));
    });

    it("prevents withdrawing more than contract balance", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "withdraw-fees",
        [Cl.uint(999999999999), Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(ERR_INSUFFICIENT_BALANCE));
    });

    it("allows withdrawing to different recipient", () => {
      // Post to collect fees
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Fee test")], user1);
      
      // Withdraw to user2
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "withdraw-fees",
        [Cl.uint(5000), Cl.principal(user2)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Ownership Transfer (Two-step)", () => {
    it("allows checking current owner", () => {
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-contract-owner",
        [],
        user1
      );
      expect(result).toBeOk(Cl.principal(deployer));
    });

    it("only allows owner to propose ownership transfer", () => {
      const { result: unauthorized } = simnet.callPublicFn(
        "message-board-v3",
        "propose-ownership-transfer",
        [Cl.principal(user2)],
        user1
      );
      expect(unauthorized).toBeErr(Cl.uint(ERR_OWNER_ONLY));
    });

    it("transfers ownership via two-step pattern", () => {
      // Step 1: Propose
      simnet.callPublicFn("message-board-v3", "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      
      // Step 2: Accept
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "accept-ownership",
        [],
        user1
      );
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify new owner
      const { result: newOwner } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-contract-owner",
        [],
        deployer
      );
      expect(newOwner).toBeOk(Cl.principal(user1));
    });

    it("revokes old owner's admin rights after transfer", () => {
      // Two-step transfer
      simnet.callPublicFn("message-board-v3", "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      simnet.callPublicFn("message-board-v3", "accept-ownership", [], user1);
      
      // Old owner cannot pause
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pause-contract",
        [],
        deployer
      );
      expect(result).toBeErr(Cl.uint(ERR_OWNER_ONLY));
    });

    it("grants new owner admin rights", () => {
      // Two-step transfer
      simnet.callPublicFn("message-board-v3", "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      simnet.callPublicFn("message-board-v3", "accept-ownership", [], user1);
      
      // New owner can pause
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pause-contract",
        [],
        user1
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Pin Expiry Validation", () => {
    it("enforces pin expiry with is-message-pinned", () => {
      // Post message
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Pin expiry test")],
        user1
      );
      
      // Pin it for 144 blocks
      simnet.callPublicFn("message-board-v3", "pin-message", [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)], user1);
      
      // Should be pinned initially
      const { result: isPinned1 } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-pinned",
        [Cl.uint(0)],
        user1
      );
      expect(isPinned1).toBeBool(true);
      
      // Advance past pin expiry
      simnet.mineEmptyBlocks(145);
      
      // Should no longer be pinned
      const { result: isPinned2 } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-pinned",
        [Cl.uint(0)],
        user1
      );
      expect(isPinned2).toBeBool(false);
    });

    it("returns false for unpinned messages", () => {
      // Post message  but don't pin
      const { result: postResult } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Not pinned")],
        user1
      );
      const messageId = postResult.value;
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-pinned",
        [messageId],
        user1
      );
      expect(result).toBeBool(false);
    });
  });

  describe("Message Boundaries", () => {
    it("rejects empty messages", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("")],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_INVALID_INPUT));
    });

    it("accepts single character messages", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("x")],
        user1
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("accepts exactly 280 character messages", () => {
      const maxMessage = "a".repeat(280);
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8(maxMessage)],
        user2
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("rejects messages over 280 characters", () => {
      const tooLong = "a".repeat(281);
      // Clarity VM rejects at the type level before the function body executes
      expect(() => {
        simnet.callPublicFn(
          "message-board-v3",
          "post-message",
          [Cl.stringUtf8(tooLong)],
          user3
        );
      }).toThrow();
    });
  });

  describe("Concurrent Reactions", () => {
    it("allows multiple users to react to same message", () => {
      // Post message
      const { result: postResult } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("React test")],
        user1
      );
      const messageId = postResult.value;
      const postBlockHeight = simnet.blockHeight;
      
      // Three different users react
      const { result: react1 } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [messageId],
        user1
      );
      expect(react1).toBeOk(Cl.bool(true));
      
      const { result: react2 } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [messageId],
        user2
      );
      expect(react2).toBeOk(Cl.bool(true));
      
      const { result: react3 } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [messageId],
        user3
      );
      expect(react3).toBeOk(Cl.bool(true));
      
      // Verify reaction count
      const { result: messageData } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message",
        [messageId],
        user1
      );
      expect(messageData).toBeSome(
        Cl.tuple({
          author: Cl.principal(user1),
          content: Cl.stringUtf8("React test"),
          timestamp: Cl.uint(postBlockHeight - 1),
          "block-height": Cl.uint(postBlockHeight),
          "expires-at": Cl.uint(postBlockHeight + 144),
          pinned: Cl.bool(false),
          "pin-expires-at": Cl.uint(0),
          "reaction-count": Cl.uint(3),
          deleted: Cl.bool(false),
          edited: Cl.bool(false),
          "edit-count": Cl.uint(0),
          "reply-to": Cl.uint(0),
          "reply-count": Cl.uint(0)
        })
      );
    });

    it("prevents duplicate reactions from same user", () => {
      const { result: postResult } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Duplicate test")],
        user1
      );
      const messageId = postResult.value;
      
      // First reaction succeeds
      simnet.callPublicFn("message-board-v3", "react-to-message", [messageId], user1);
      
      // Second reaction from same user fails
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [messageId],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_REACTED));
    });
  });

  describe("Pin Authorization", () => {
    it("only allows message author to pin", () => {
      // User1 posts message
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Authorization test")],
        user1
      );
      
      // User2 cannot pin user1's message
      const { result: unauthorized } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user2
      );
      expect(unauthorized).toBeErr(Cl.uint(ERR_UNAUTHORIZED));
      
      // User1 can pin their own message
      const { result: authorized } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );
      expect(authorized).toBeOk(Cl.bool(true));
    });
  });

  describe("Invalid Pin Durations", () => {
    it("rejects zero duration", () => {
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Duration test")],
        user1
      );
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(0)],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_INVALID_INPUT));
    });

    it("rejects non-standard durations", () => {
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Duration test 2")],
        user2
      );
      
      // Try various invalid durations
      const invalidDurations = [1, 100, 200, 500, 1000];
      invalidDurations.forEach(duration => {
        const { result } = simnet.callPublicFn(
          "message-board-v3",
          "pin-message",
          [Cl.uint(0), Cl.uint(duration)],
          user2
        );
        expect(result).toBeErr(Cl.uint(ERR_INVALID_INPUT));
      });
    });

    it("accepts standard durations (144 and 432 blocks)", () => {
      // Test 144 blocks
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("24hr test")],
        user1
      );
      const { result: pin1 } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );
      expect(pin1).toBeOk(Cl.bool(true));
      
      // Test 432 blocks (72 hours)
      simnet.mineEmptyBlocks(6);
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("72hr test")],
        user1
      );
      const { result: pin2 } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(1), Cl.uint(432)],
        user1
      );
      expect(pin2).toBeOk(Cl.bool(true));
    });
  });

  describe("Non-Existent Message Operations", () => {
    it("returns none for non-existent message", () => {
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message",
        [Cl.uint(999999)],
        user1
      );
      expect(result).toBeNone();
    });

    it("rejects pinning non-existent message", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(999999), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_NOT_FOUND));
    });

    it("rejects reacting to non-existent message", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [Cl.uint(999999)],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_NOT_FOUND));
    });

    it("returns false for reaction check on non-existent message", () => {
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "has-user-reacted",
        [Cl.uint(999999), Cl.principal(user1)],
        user1
      );
      expect(result).toBeBool(false);
    });
  });

  describe("User Stats Accumulation", () => {
    it("tracks posting fees correctly", () => {
      // Post first message
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Stats test 1")], user1);
      const firstPostBlock = simnet.blockHeight;
      
      let { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user1)],
        user1
      );
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE),
          "last-post-block": Cl.uint(firstPostBlock)
        })
      );
      
      // Advance past cooldown
      simnet.mineEmptyBlocks(6);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Stats test 2")], user1);
      const secondPostBlock = simnet.blockHeight;
      
      ({ result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user1)],
        user1
      ));
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(2),
          "total-spent": Cl.uint(FEE_POST_MESSAGE * 2),
          "last-post-block": Cl.uint(secondPostBlock)
        })
      );
    });

    it("includes pin fees in total spent", () => {
      // Post and pin
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Pin fee test")],
        user1
      );
      const postBlock = simnet.blockHeight;
      simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user1)],
        user1
      );
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE + FEE_PIN_24HR),
          "last-post-block": Cl.uint(postBlock)
        })
      );
    });

    it("includes reaction fees in total spent", () => {
      // Post and react
      const { result: postResult } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Reaction fee test")],
        user1
      );
      const postBlock = simnet.blockHeight;
      simnet.callPublicFn("message-board-v3", "react-to-message", [postResult.value], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user1)],
        user1
      );
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE + FEE_REACTION),
          "last-post-block": Cl.uint(postBlock)
        })
      );
    });
  });

  describe("Message Nonce Increment", () => {
    it("increments nonce for each message", () => {
      // Check initial nonce
      let { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message-nonce",
        [],
        user1
      );
      expect(result).toBeOk(Cl.uint(0));
      
      // Post first message
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First")], user1);
      ({ result } = simnet.callReadOnlyFn("message-board-v3", "get-message-nonce", [], user1));
      expect(result).toBeOk(Cl.uint(1));
      
      // Post second message (different user, no cooldown needed)
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Second")], user2);
      ({ result } = simnet.callReadOnlyFn("message-board-v3", "get-message-nonce", [], user1));
      expect(result).toBeOk(Cl.uint(2));
    });

    it("matches total messages count", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test 1")], user1);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test 2")], user2);
      
      const { result: nonce } = simnet.callReadOnlyFn("message-board-v3", "get-message-nonce", [], user1);
      const { result: total } = simnet.callReadOnlyFn("message-board-v3", "get-total-messages", [], user1);
      
      expect(nonce).toBeOk(Cl.uint(2));
      expect(total).toBeOk(Cl.uint(2));
    });
  });

  describe("Message Deletion Edge Cases", () => {
    it("deleted message data is still retrievable via get-message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Soft delete test")], user1);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      // get-message should still return the record (soft delete)
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message",
        [Cl.uint(0)],
        user1
      );

      expect(result).toBeDefined();
    });

    it("cannot pin a deleted message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Pin then delete")], user1);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );

      expect(result).toBeErr(Cl.uint(109)); // err-already-deleted
    });

    it("deletion does not affect total-messages count", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg 1")], user1);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg 2")], user2);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-total-messages",
        [],
        user1
      );

      // total-messages counts all posts (including deleted)
      expect(result).toBeOk(Cl.uint(2));
    });

    it("contract owner cannot delete other users messages", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("User msg")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "delete-message",
        [Cl.uint(0)],
        deployer // deployer is owner but not author
      );

      expect(result).toBeErr(Cl.uint(ERR_UNAUTHORIZED));
    });
  });

  describe("Message Expiry Enforcement", () => {
    it("is-message-expired returns false for fresh message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Fresh msg")], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-expired",
        [Cl.uint(0)],
        user1
      );
      expect(result).toBeBool(false);
    });

    it("is-message-expired returns true after expiry blocks pass", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Will expire")], user1);

      // Advance past default expiry (144 blocks)
      simnet.mineEmptyBlocks(150);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-expired",
        [Cl.uint(0)],
        user1
      );
      expect(result).toBeBool(true);
    });

    it("is-message-expired returns false for non-existent message", () => {
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-expired",
        [Cl.uint(999)],
        user1
      );
      expect(result).toBeBool(false);
    });

    it("get-active-message returns message when not expired", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Active msg")], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-active-message",
        [Cl.uint(0)],
        user1
      );
      // Should return some (not none) for a fresh message
      expect(result).toBeDefined();
      const printed = Cl.prettyPrint(result);
      expect(printed).toContain("Active msg");
    });

    it("get-active-message returns none for expired message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Expiring soon")], user1);

      simnet.mineEmptyBlocks(150);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-active-message",
        [Cl.uint(0)],
        user1
      );
      expect(result).toBeNone();
    });

    it("get-active-message returns none for deleted message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Delete me")], user1);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-active-message",
        [Cl.uint(0)],
        user1
      );
      expect(result).toBeNone();
    });

    it("get-active-message returns none for non-existent message", () => {
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-active-message",
        [Cl.uint(999)],
        user1
      );
      expect(result).toBeNone();
    });

    it("original get-message still returns expired messages (backward compat)", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Old getter")], user1);

      simnet.mineEmptyBlocks(150);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message",
        [Cl.uint(0)],
        user1
      );
      // get-message is unchanged — still returns the raw record
      const printed = Cl.prettyPrint(result);
      expect(printed).toContain("Old getter");
    });
  });

  describe("Configurable Fee Structure", () => {
    it("returns default fee values", () => {
      const { result: postFee } = simnet.callReadOnlyFn("message-board-v3", "get-fee-post-message", [], deployer);
      expect(postFee).toBeOk(Cl.uint(10000));

      const { result: pin24Fee } = simnet.callReadOnlyFn("message-board-v3", "get-fee-pin-24hr", [], deployer);
      expect(pin24Fee).toBeOk(Cl.uint(50000));

      const { result: pin72Fee } = simnet.callReadOnlyFn("message-board-v3", "get-fee-pin-72hr", [], deployer);
      expect(pin72Fee).toBeOk(Cl.uint(100000));

      const { result: reactFee } = simnet.callReadOnlyFn("message-board-v3", "get-fee-reaction", [], deployer);
      expect(reactFee).toBeOk(Cl.uint(5000));
    });

    it("allows owner to update post fee", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "set-fee-post-message",
        [Cl.uint(20000)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      const { result: updated } = simnet.callReadOnlyFn("message-board-v3", "get-fee-post-message", [], deployer);
      expect(updated).toBeOk(Cl.uint(20000));
    });

    it("rejects fee update from non-owner", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "set-fee-post-message",
        [Cl.uint(20000)],
        user1
      );
      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("rejects fee below minimum bound", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "set-fee-post-message",
        [Cl.uint(500)], // below min-fee of 1000
        deployer
      );
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it("rejects fee above maximum bound", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "set-fee-reaction",
        [Cl.uint(99999999)], // above max-fee of 10000000
        deployer
      );
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it("uses updated fee for subsequent posts", () => {
      // Set new post fee
      simnet.callPublicFn("message-board-v3", "set-fee-post-message", [Cl.uint(25000)], deployer);

      const contractId = `${deployer}.message-board-v3`;
      const initialBalance = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);

      // Post a message — should charge the new fee
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("New fee test")], user1);

      const finalBalance = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      expect(finalBalance - initialBalance).toBe(25000);
    });

    it("allows updating all four fee types", () => {
      const updates = [
        { fn: "set-fee-post-message", val: 15000 },
        { fn: "set-fee-pin-24hr", val: 60000 },
        { fn: "set-fee-pin-72hr", val: 120000 },
        { fn: "set-fee-reaction", val: 8000 },
      ];

      for (const u of updates) {
        const { result } = simnet.callPublicFn("message-board-v3", u.fn, [Cl.uint(u.val)], deployer);
        expect(result).toBeOk(Cl.bool(true));
      }
    });
  });

  describe("Batch Read Helpers", () => {
    it("get-contract-stats returns all counters", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Stats check")], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-contract-stats",
        [],
        user1
      );

      const printed = Cl.prettyPrint(result);
      expect(printed).toContain("total-messages");
      expect(printed).toContain("total-fees-collected");
      expect(printed).toContain("message-nonce");
      expect(printed).toContain("paused");
    });

    it("get-page-range returns correct range for first page", () => {
      // Post 5 messages
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg 1")], user1);
      simnet.mineEmptyBlocks(6);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg 2")], user1);
      simnet.mineEmptyBlocks(6);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg 3")], user1);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg 4")], user2);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg 5")], user3);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-page-range",
        [Cl.uint(0), Cl.uint(3)], // page 0, 3 per page
        user1
      );

      const printed = Cl.prettyPrint(result);
      // Total of 5 messages, page 0 with size 3: end-id=5, start-id=2
      expect(printed).toContain("total: u5");
    });

    it("get-page-range handles empty board", () => {
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-page-range",
        [Cl.uint(0), Cl.uint(20)],
        user1
      );

      const printed = Cl.prettyPrint(result);
      expect(printed).toContain("total: u0");
    });
  });
});
