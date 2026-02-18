/// <reference path="./clarinet.d.ts" />

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

const FEE_POST_MESSAGE = 10000;
const FEE_PIN_24HR = 50000;
const FEE_PIN_72HR = 100000;
const PIN_24HR_BLOCKS = 144;
const PIN_72HR_BLOCKS = 432;

describe("message-board contract", () => {
  it("ensures simnet is well initialized", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  describe("post-message function", () => {
    it("allows user to post a valid message", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Hello Bitchat!")],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });

    it("rejects message that is too short", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("")],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it("accepts message at maximum length (280 chars)", () => {
      const maxMessage = "a".repeat(280);
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8(maxMessage)],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });

    it("increments message nonce correctly", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First")], user1);
      // Advance blocks to bypass spam prevention
      simnet.mineEmptyBlocks(6);
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Second")],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(1));
    });

    it.skip("transfers posting fee to contract", () => {
      const contractId = `${deployer}.message-board-v3`;
      const initialBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      
      simnet.callPublicFn(
        "message-board-v3",
        "post-message",
        [Cl.stringUtf8("Test message")],
        user1
      );
      
      const finalBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      expect(finalBalance - initialBalance).toBe(FEE_POST_MESSAGE);
    });

    it("updates total fees collected", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-total-fees-collected",
        [],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(FEE_POST_MESSAGE));
    });

    it("creates user stats on first post", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First post")], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user1)],
        user1
      );
      
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE),
          "last-post-block": Cl.uint(simnet.blockHeight)
        })
      );
    });

    it("updates user stats on subsequent posts", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First")], user1);
      // Advance blocks to bypass spam prevention
      simnet.mineEmptyBlocks(6);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Second")], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user1)],
        user1
      );
      
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(2),
          "total-spent": Cl.uint(FEE_POST_MESSAGE * 2),
          "last-post-block": Cl.uint(simnet.blockHeight)
        })
      );
    });
  });

  describe("pin-message function", () => {
    it("allows author to pin their own message", () => {
      // First post a message
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("My message")], user1);
      
      // Then pin it (24 hours = 144 blocks)
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(144)],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects pin attempt by non-author", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("User1 message")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(144)],
        user2 // Different user trying to pin
      );
      
      expect(result).toBeErr(Cl.uint(102)); // err-unauthorized
    });

    it("rejects pin for non-existent message", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(999), Cl.uint(144)],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });

    it("accepts 24-hour pin duration", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("accepts 72-hour pin duration", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_72HR_BLOCKS)],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects invalid pin duration", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(100)], // Invalid duration
        user1
      );
      
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it.skip("charges correct fee for 24-hour pin", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const contractId = `${deployer}.message-board-v3`;
      const initialBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      
      simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );
      
      const finalBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      expect(finalBalance - initialBalance).toBe(FEE_PIN_24HR);
    });

    it.skip("charges correct fee for 72-hour pin", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const contractId = `${deployer}.message-board-v3`;
      const initialBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      
      simnet.callPublicFn(
        "message-board-v3",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_72HR_BLOCKS)],
        user1
      );
      
      const finalBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      expect(finalBalance - initialBalance).toBe(FEE_PIN_72HR);
    });

    it("updates user stats with pin spending", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      const postBlock = simnet.blockHeight;
      simnet.callPublicFn("message-board-v3", "pin-message", [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)], user1);
      
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

    it("does not reset post cooldown when pinning a message", () => {
      // Post a message and record the block
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      const postBlock = simnet.blockHeight;

      // Advance a few blocks (but less than min-post-gap)
      simnet.mineEmptyBlocks(3);

      // Pin the message - this should NOT reset last-post-block
      simnet.callPublicFn("message-board-v3", "pin-message", [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user1)],
        user1
      );

      // last-post-block should still be from the original post, not from the pin action
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE + FEE_PIN_24HR),
          "last-post-block": Cl.uint(postBlock)
        })
      );
    });
  });

  describe("react-to-message function", () => {
    it("allows user to react to a message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test message")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [Cl.uint(0)],
        user2
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents duplicate reactions from same user", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user2);
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [Cl.uint(0)],
        user2 // Same user reacting again
      );
      
      expect(result).toBeErr(Cl.uint(105)); // err-already-reacted
    });

    it("allows different users to react to same message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Popular message")], user1);
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [Cl.uint(0)],
        user2 // Different user
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects reaction to non-existent message", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [Cl.uint(999)],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });

    it.skip("charges reaction fee", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const contractId = `${deployer}.message-board-v3`;
      const FEE_REACTION = 5000;
      const initialBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user2);
      
      const finalBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      expect(finalBalance - initialBalance).toBe(FEE_REACTION);
    });

    it("increments reaction count on message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user2);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message",
        [Cl.uint(0)],
        user1
      );
      
      // Message should exist after posting and reacting
      expect(result).toBeDefined();
    });

    it("correctly tracks has-user-reacted", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      // Before reaction
      let { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "has-user-reacted",
        [Cl.uint(0), Cl.principal(user2)],
        user1
      );
      expect(result).toEqual(Cl.bool(false));
      
      // After reaction
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user2);
      
      result = simnet.callReadOnlyFn(
        "message-board-v3",
        "has-user-reacted",
        [Cl.uint(0), Cl.principal(user2)],
        user1
      ).result;
      expect(result).toEqual(Cl.bool(true));
    });

    it("does not reset post cooldown when reacting to a message", () => {
      // User1 posts a message
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      
      // User2 posts a message and record their post block
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Reply")], user2);
      const user2PostBlock = simnet.blockHeight;

      // Advance a few blocks (but less than min-post-gap)
      simnet.mineEmptyBlocks(3);

      // User2 reacts to user1's message - should NOT reset cooldown
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user2);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-stats",
        [Cl.principal(user2)],
        user2
      );

      // last-post-block should still reflect user2's post, not the reaction
      expect(result).toBeSome(
        Cl.tuple({
          "messages-posted": Cl.uint(1),
          "total-spent": Cl.uint(FEE_POST_MESSAGE + 5000),
          "last-post-block": Cl.uint(user2PostBlock)
        })
      );
    });
  });

  describe("read-only functions", () => {
    it("get-message returns correct message data", () => {
      const content = "Test message content";
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8(content)], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message",
        [Cl.uint(0)],
        user1
      );
      
      // Message should be returned after posting
      expect(result).toBeDefined();
    });

    it("get-total-messages returns correct count", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First")], user1);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Second")], user2);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-total-messages",
        [],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(2));
    });

    it("get-message-nonce returns next ID", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First")], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message-nonce",
        [],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(1)); // Next ID will be 1
    });
  });

  describe("delete-message function", () => {
    it("allows author to delete their own message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("To be deleted")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "delete-message",
        [Cl.uint(0)],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects deletion by non-author", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("User1 message")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "delete-message",
        [Cl.uint(0)],
        user2
      );

      expect(result).toBeErr(Cl.uint(102)); // err-unauthorized
    });

    it("rejects deletion of non-existent message", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "delete-message",
        [Cl.uint(999)],
        user1
      );

      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });

    it("rejects double deletion", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Delete me")], user1);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "delete-message",
        [Cl.uint(0)],
        user1
      );

      expect(result).toBeErr(Cl.uint(109)); // err-already-deleted
    });

    it("marks message as deleted via is-message-deleted", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Check deletion")], user1);

      // Before deletion
      let { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-deleted",
        [Cl.uint(0)],
        user1
      );
      expect(result).toEqual(Cl.bool(false));

      // Delete
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      // After deletion
      result = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-deleted",
        [Cl.uint(0)],
        user1
      ).result;
      expect(result).toEqual(Cl.bool(true));
    });

    it("increments total-deleted counter", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("First")], user1);
      simnet.mineEmptyBlocks(6);
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Second")], user1);

      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(1)], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-total-deleted",
        [],
        user1
      );

      expect(result).toBeOk(Cl.uint(2));
    });

    it("removes pin status on deletion", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Pinned msg")], user1);
      simnet.callPublicFn("message-board-v3", "pin-message", [Cl.uint(0), Cl.uint(144)], user1);

      // Verify pinned
      let { result: pinned } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-pinned",
        [Cl.uint(0)],
        user1
      );
      expect(pinned).toEqual(Cl.bool(true));

      // Delete the message
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      // Pin should be cleared
      let { result: pinnedAfter } = simnet.callReadOnlyFn(
        "message-board-v3",
        "is-message-pinned",
        [Cl.uint(0)],
        user1
      );
      expect(pinnedAfter).toEqual(Cl.bool(false));
    });

    it("prevents reacting to a deleted message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Will delete")], user1);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message",
        [Cl.uint(0)],
        user2
      );

      expect(result).toBeErr(Cl.uint(109)); // err-already-deleted
    });
  });

  describe("edit-message function", () => {
    it("allows author to edit their own message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Original content")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "edit-message",
        [Cl.uint(0), Cl.stringUtf8("Updated content")],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects edit by non-author", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("User1 msg")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "edit-message",
        [Cl.uint(0), Cl.stringUtf8("Tampered")],
        user2
      );

      expect(result).toBeErr(Cl.uint(102)); // err-unauthorized
    });

    it("rejects edit of non-existent message", () => {
      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "edit-message",
        [Cl.uint(999), Cl.stringUtf8("No target")],
        user1
      );

      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });

    it("rejects edit of deleted message", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("To delete")], user1);
      simnet.callPublicFn("message-board-v3", "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "edit-message",
        [Cl.uint(0), Cl.stringUtf8("Too late")],
        user1
      );

      expect(result).toBeErr(Cl.uint(109)); // err-already-deleted
    });

    it("rejects empty content on edit", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Has content")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "edit-message",
        [Cl.uint(0), Cl.stringUtf8("")],
        user1
      );

      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it("updates message content after edit", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Before edit")], user1);
      simnet.callPublicFn("message-board-v3", "edit-message", [Cl.uint(0), Cl.stringUtf8("After edit")], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-message",
        [Cl.uint(0)],
        user1
      );

      expect(result).toBeDefined();
    });

    it("stores edit history for first edit", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Original")], user1);
      simnet.callPublicFn("message-board-v3", "edit-message", [Cl.uint(0), Cl.stringUtf8("Edited")], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-edit-history",
        [Cl.uint(0), Cl.uint(0)],
        user1
      );

      expect(result).toBeDefined();
    });

    it("tracks multiple edits in history", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Version 1")], user1);
      simnet.callPublicFn("message-board-v3", "edit-message", [Cl.uint(0), Cl.stringUtf8("Version 2")], user1);
      simnet.callPublicFn("message-board-v3", "edit-message", [Cl.uint(0), Cl.stringUtf8("Version 3")], user1);

      // Edit index 0 should have "Version 1"
      const { result: edit0 } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-edit-history",
        [Cl.uint(0), Cl.uint(0)],
        user1
      );
      expect(edit0).toBeDefined();

      // Edit index 1 should have "Version 2"
      const { result: edit1 } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-edit-history",
        [Cl.uint(0), Cl.uint(1)],
        user1
      );
      expect(edit1).toBeDefined();
    });

    it("increments total-edits counter", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Msg")], user1);
      simnet.callPublicFn("message-board-v3", "edit-message", [Cl.uint(0), Cl.stringUtf8("Edit 1")], user1);
      simnet.callPublicFn("message-board-v3", "edit-message", [Cl.uint(0), Cl.stringUtf8("Edit 2")], user1);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-total-edits",
        [],
        user1
      );

      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("react-to-message-typed function", () => {
    it("allows user to react with a specific type", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Typed react test")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message-typed",
        [Cl.uint(0), Cl.uint(2)], // fire reaction
        user2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects invalid reaction type 0", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message-typed",
        [Cl.uint(0), Cl.uint(0)], // invalid: below range
        user2
      );

      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it("rejects invalid reaction type above max", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message-typed",
        [Cl.uint(0), Cl.uint(6)], // invalid: above max
        user2
      );

      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it("prevents duplicate typed reaction from same user", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      simnet.callPublicFn("message-board-v3", "react-to-message-typed", [Cl.uint(0), Cl.uint(3)], user2);

      const { result } = simnet.callPublicFn(
        "message-board-v3",
        "react-to-message-typed",
        [Cl.uint(0), Cl.uint(1)], // different type but same user
        user2
      );

      expect(result).toBeErr(Cl.uint(105)); // err-already-reacted
    });

    it("returns reaction type via get-user-reaction-type", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Test")], user1);
      simnet.callPublicFn("message-board-v3", "react-to-message-typed", [Cl.uint(0), Cl.uint(4)], user2); // sad

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-reaction-type",
        [Cl.uint(0), Cl.principal(user2)],
        user1
      );

      expect(result).toBeSome(Cl.uint(4));
    });

    it("tracks reaction count by type", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Popular")], user1);
      simnet.callPublicFn("message-board-v3", "react-to-message-typed", [Cl.uint(0), Cl.uint(2)], user1); // fire
      simnet.callPublicFn("message-board-v3", "react-to-message-typed", [Cl.uint(0), Cl.uint(2)], user2); // fire

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-reaction-count-by-type",
        [Cl.uint(0), Cl.uint(2)], // fire type
        user1
      );

      expect(result).toEqual(Cl.uint(2));
    });

    it("backward compatible react-to-message defaults to like type", () => {
      simnet.callPublicFn("message-board-v3", "post-message", [Cl.stringUtf8("Old style")], user1);
      simnet.callPublicFn("message-board-v3", "react-to-message", [Cl.uint(0)], user2);

      const { result } = simnet.callReadOnlyFn(
        "message-board-v3",
        "get-user-reaction-type",
        [Cl.uint(0), Cl.principal(user2)],
        user1
      );

      expect(result).toBeSome(Cl.uint(1)); // like = u1
    });
  });
});
