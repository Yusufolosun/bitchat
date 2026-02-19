/// <reference path="./clarinet.d.ts" />

/**
 * Mainnet Readiness Test Suite for message-board-v3
 *
 * Covers security-critical scenarios, economic invariants, and edge cases
 * that MUST pass before mainnet deployment.
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;
const user4 = accounts.get("wallet_4")!;
const user5 = accounts.get("wallet_5")!;

// Fee constants (must match contract)
const FEE_POST = 10000;
const FEE_PIN_24 = 50000;
const FEE_PIN_72 = 100000;
const FEE_REACT = 5000;
const PIN_24_BLOCKS = 144;
const PIN_72_BLOCKS = 432;
const MIN_POST_GAP = 6;
const MAX_MSG_LEN = 280;
const MAX_EDIT_COUNT = 10;
const DEFAULT_EXPIRY = 144;

// Error codes
const ERR_OWNER_ONLY = 100;
const ERR_NOT_FOUND = 101;
const ERR_UNAUTHORIZED = 102;
const ERR_INVALID_INPUT = 103;
const ERR_MAX_EDITS = 104;
const ERR_ALREADY_REACTED = 105;
const ERR_TOO_SOON = 106;
const ERR_PAUSED = 107;
const ERR_INSUFFICIENT_BAL = 108;
const ERR_ALREADY_DELETED = 109;
const ERR_NO_PENDING = 110;
const ERR_NOT_PROPOSED = 111;

const CONTRACT = "message-board-v3";

// Helper: post a message and return message-id
function postMsg(content: string, sender: string) {
  return simnet.callPublicFn(CONTRACT, "post-message", [Cl.stringUtf8(content)], sender);
}

describe("Mainnet Readiness - Security Tests", () => {

  describe("Single-step transfer-ownership removed", () => {
    it("transfer-ownership function no longer exists on the contract", () => {
      // Calling the removed function should throw (function not found)
      expect(() => {
        simnet.callPublicFn(
          CONTRACT,
          "transfer-ownership",
          [Cl.principal(user1)],
          deployer
        );
      }).toThrow();
    });
  });

  describe("Max edit count enforcement", () => {
    it("allows up to 10 edits on a message", () => {
      postMsg("Original content", user1);

      for (let i = 1; i <= MAX_EDIT_COUNT; i++) {
        const { result } = simnet.callPublicFn(
          CONTRACT,
          "edit-message",
          [Cl.uint(0), Cl.stringUtf8(`Edit #${i}`)],
          user1
        );
        expect(result).toBeOk(Cl.bool(true));
      }
    });

    it("rejects the 11th edit with err-max-edits-reached (u104)", () => {
      postMsg("Will be edited many times", user1);

      // Perform 10 edits
      for (let i = 1; i <= MAX_EDIT_COUNT; i++) {
        simnet.callPublicFn(
          CONTRACT,
          "edit-message",
          [Cl.uint(0), Cl.stringUtf8(`Edit ${i}`)],
          user1
        );
      }

      // 11th edit should fail
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "edit-message",
        [Cl.uint(0), Cl.stringUtf8("One too many")],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_MAX_EDITS));
    });

    it("edit count is tracked per-message independently", () => {
      postMsg("Message A", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      postMsg("Message B", user1);

      // Edit message A 5 times
      for (let i = 0; i < 5; i++) {
        simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8(`A-edit-${i}`)], user1);
      }

      // Message B should still have full edit budget
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "edit-message",
        [Cl.uint(1), Cl.stringUtf8("B first edit")],
        user1
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Fee accounting integrity", () => {
    it("contract balance matches total fees collected", () => {
      const contractId = `${deployer}.${CONTRACT}`;

      // Generate fees from multiple operations
      postMsg("Post fee", user1);
      simnet.callPublicFn(CONTRACT, "react-to-message", [Cl.uint(0)], user2);
      simnet.callPublicFn(CONTRACT, "pin-message", [Cl.uint(0), Cl.uint(PIN_24_BLOCKS)], user1);

      const expectedTotal = FEE_POST + FEE_REACT + FEE_PIN_24;
      const contractBalance = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);

      expect(contractBalance).toBe(expectedTotal);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-total-fees-collected", [], deployer);
      expect(result).toBeOk(Cl.uint(expectedTotal));
    });

    it("partial withdrawal leaves correct remaining balance", () => {
      const contractId = `${deployer}.${CONTRACT}`;
      postMsg("Generate fees", user1);

      // Withdraw half
      simnet.callPublicFn(CONTRACT, "withdraw-fees", [Cl.uint(5000), Cl.principal(deployer)], deployer);

      const remaining = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      expect(remaining).toBe(FEE_POST - 5000);
    });

    it("full withdrawal leaves zero balance", () => {
      const contractId = `${deployer}.${CONTRACT}`;
      postMsg("Generate fees", user1);

      simnet.callPublicFn(CONTRACT, "withdraw-fees", [Cl.uint(FEE_POST), Cl.principal(deployer)], deployer);

      const remaining = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      expect(remaining).toBe(0);
    });

    it("cannot withdraw after full withdrawal without new fees", () => {
      postMsg("Generate fees", user1);
      simnet.callPublicFn(CONTRACT, "withdraw-fees", [Cl.uint(FEE_POST), Cl.principal(deployer)], deployer);

      const { result } = simnet.callPublicFn(
        CONTRACT,
        "withdraw-fees",
        [Cl.uint(1), Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(ERR_INSUFFICIENT_BAL));
    });

    it("multiple posts from different users accumulate fees correctly", () => {
      const contractId = `${deployer}.${CONTRACT}`;
      postMsg("User1 post", user1);
      postMsg("User2 post", user2);
      postMsg("User3 post", user3);

      const expected = FEE_POST * 3;
      const balance = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      expect(balance).toBe(expected);
    });
  });

  describe("Spam prevention robustness", () => {
    it("enforces cooldown per-user independently", () => {
      postMsg("User1 first", user1);

      // User1 can't post again immediately
      const { result: tooSoon } = postMsg("User1 second", user1);
      expect(tooSoon).toBeErr(Cl.uint(ERR_TOO_SOON));

      // User2 CAN post (different cooldown)
      const { result: ok } = postMsg("User2 first", user2);
      expect(ok).toBeOk(Cl.uint(1));
    });

    it("cooldown resets after successful post", () => {
      postMsg("First", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      postMsg("Second", user1);
      
      // Immediately after second post, should be blocked again
      const { result } = postMsg("Third too soon", user1);
      expect(result).toBeErr(Cl.uint(ERR_TOO_SOON));
      
      // Wait again
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      const { result: ok } = postMsg("Third after wait", user1);
      expect(ok).toBeOk(Cl.uint(2));
    });

    it("replies also enforce cooldown", () => {
      postMsg("Parent", user1);
      
      // User1 just posted, reply should fail (same cooldown)
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "reply-to-message",
        [Cl.uint(0), Cl.stringUtf8("Reply too soon")],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_TOO_SOON));
    });

    it("editing does NOT trigger cooldown", () => {
      postMsg("Editable", user1);
      
      // Edit immediately — should work (no cooldown for edits)
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "edit-message",
        [Cl.uint(0), Cl.stringUtf8("Edited version")],
        user1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("reacting does NOT trigger cooldown for future posts", () => {
      postMsg("Reactable", user1);
      postMsg("User2 post", user2);
      const user2PostBlock = simnet.blockHeight;
      
      simnet.mineEmptyBlocks(3);
      
      // User2 reacts
      simnet.callPublicFn(CONTRACT, "react-to-message", [Cl.uint(0)], user2);
      
      // User2's last-post-block should still be their post block, not the reaction
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-user-stats",
        [Cl.principal(user2)],
        user2
      );
      const stats = Cl.prettyPrint(result);
      expect(stats).toContain(`last-post-block: u${user2PostBlock}`);
    });
  });

  describe("Pause/unpause security", () => {
    it("all write operations fail when paused", () => {
      // Post a message first for subsequent tests
      postMsg("Before pause", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      
      simnet.callPublicFn(CONTRACT, "pause-contract", [], deployer);

      // post-message
      expect(postMsg("Fail", user2).result).toBeErr(Cl.uint(ERR_PAUSED));

      // pin-message
      expect(
        simnet.callPublicFn(CONTRACT, "pin-message", [Cl.uint(0), Cl.uint(PIN_24_BLOCKS)], user1).result
      ).toBeErr(Cl.uint(ERR_PAUSED));

      // react-to-message
      expect(
        simnet.callPublicFn(CONTRACT, "react-to-message", [Cl.uint(0)], user2).result
      ).toBeErr(Cl.uint(ERR_PAUSED));

      // react-to-message-typed
      expect(
        simnet.callPublicFn(CONTRACT, "react-to-message-typed", [Cl.uint(0), Cl.uint(2)], user2).result
      ).toBeErr(Cl.uint(ERR_PAUSED));

      // delete-message
      expect(
        simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1).result
      ).toBeErr(Cl.uint(ERR_PAUSED));

      // edit-message
      expect(
        simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("edited")], user1).result
      ).toBeErr(Cl.uint(ERR_PAUSED));

      // reply-to-message
      expect(
        simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("reply")], user2).result
      ).toBeErr(Cl.uint(ERR_PAUSED));
    });

    it("read-only functions still work when paused", () => {
      postMsg("Readable", user1);
      simnet.callPublicFn(CONTRACT, "pause-contract", [], deployer);

      const { result: msg } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      expect(msg).toBeDefined();

      const { result: total } = simnet.callReadOnlyFn(CONTRACT, "get-total-messages", [], user1);
      expect(total).toBeOk(Cl.uint(1));

      const { result: paused } = simnet.callReadOnlyFn(CONTRACT, "is-contract-paused", [], user1);
      expect(paused).toBeBool(true);
    });

    it("admin can still withdraw fees and manage ownership when paused", () => {
      postMsg("Fees", user1);
      simnet.callPublicFn(CONTRACT, "pause-contract", [], deployer);

      // Withdraw should still work
      const { result: wd } = simnet.callPublicFn(
        CONTRACT,
        "withdraw-fees",
        [Cl.uint(5000), Cl.principal(deployer)],
        deployer
      );
      expect(wd).toBeOk(Cl.bool(true));

      // Propose ownership should still work
      const { result: prop } = simnet.callPublicFn(
        CONTRACT,
        "propose-ownership-transfer",
        [Cl.principal(user1)],
        deployer
      );
      expect(prop).toBeOk(Cl.bool(true));
    });
  });

  describe("Two-step ownership transfer security", () => {
    it("proposed owner is cleared after acceptance", () => {
      simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      simnet.callPublicFn(CONTRACT, "accept-ownership", [], user1);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-proposed-owner", [], user1);
      expect(result).toBeOk(Cl.none());
    });

    it("new owner can perform all admin actions after transfer", () => {
      simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      simnet.callPublicFn(CONTRACT, "accept-ownership", [], user1);

      // Pause
      expect(simnet.callPublicFn(CONTRACT, "pause-contract", [], user1).result).toBeOk(Cl.bool(true));
      // Unpause
      expect(simnet.callPublicFn(CONTRACT, "unpause-contract", [], user1).result).toBeOk(Cl.bool(true));
      // Propose new transfer
      expect(
        simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user2)], user1).result
      ).toBeOk(Cl.bool(true));
    });

    it("old owner loses ALL privileges after transfer", () => {
      simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      simnet.callPublicFn(CONTRACT, "accept-ownership", [], user1);

      expect(simnet.callPublicFn(CONTRACT, "pause-contract", [], deployer).result)
        .toBeErr(Cl.uint(ERR_OWNER_ONLY));
      expect(simnet.callPublicFn(CONTRACT, "unpause-contract", [], deployer).result)
        .toBeErr(Cl.uint(ERR_OWNER_ONLY));
      expect(
        simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user2)], deployer).result
      ).toBeErr(Cl.uint(ERR_OWNER_ONLY));
    });

    it("cancel clears proposed owner and prevents acceptance", () => {
      simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      simnet.callPublicFn(CONTRACT, "cancel-ownership-transfer", [], deployer);

      // user1 cannot accept after cancellation
      const { result } = simnet.callPublicFn(CONTRACT, "accept-ownership", [], user1);
      expect(result).toBeErr(Cl.uint(ERR_NO_PENDING));
    });

    it("overwriting a proposal replaces the pending owner", () => {
      simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user1)], deployer);
      simnet.callPublicFn(CONTRACT, "propose-ownership-transfer", [Cl.principal(user2)], deployer);

      // user1 can no longer accept
      expect(simnet.callPublicFn(CONTRACT, "accept-ownership", [], user1).result)
        .toBeErr(Cl.uint(ERR_NOT_PROPOSED));
      // user2 CAN accept
      expect(simnet.callPublicFn(CONTRACT, "accept-ownership", [], user2).result)
        .toBeOk(Cl.bool(true));
    });
  });

  describe("Pin behavior", () => {
    it("re-pinning extends the expiry (costs fee each time)", () => {
      postMsg("Pin me", user1);
      
      const blockAfterPost = simnet.blockHeight;
      simnet.callPublicFn(CONTRACT, "pin-message", [Cl.uint(0), Cl.uint(PIN_24_BLOCKS)], user1);
      
      // First pin sets expiry to blockAfterPost + some + 144
      const { result: msg1 } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      const firstExpiry = Cl.prettyPrint(msg1);
      
      simnet.mineEmptyBlocks(50);
      
      // Re-pin: should reset expiry from NOW + 144
      simnet.callPublicFn(CONTRACT, "pin-message", [Cl.uint(0), Cl.uint(PIN_24_BLOCKS)], user1);
      const { result: msg2 } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      const secondExpiry = Cl.prettyPrint(msg2);
      
      // The expiry should be different (later) after re-pin
      expect(secondExpiry).not.toEqual(firstExpiry);
    });

    it("pin does not affect message content or reactions", () => {
      postMsg("Pin test", user1);
      simnet.callPublicFn(CONTRACT, "react-to-message", [Cl.uint(0)], user2);
      simnet.callPublicFn(CONTRACT, "pin-message", [Cl.uint(0), Cl.uint(PIN_24_BLOCKS)], user1);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      const msg = Cl.prettyPrint(result);
      expect(msg).toContain("reaction-count: u1");
      expect(msg).toContain('content: u"Pin test"');
    });

    it("72-hour pin costs more than 24-hour pin", () => {
      const contractId = `${deployer}.${CONTRACT}`;

      postMsg("Pin 24", user1);
      postMsg("Pin 72", user2);

      const before24 = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      simnet.callPublicFn(CONTRACT, "pin-message", [Cl.uint(0), Cl.uint(PIN_24_BLOCKS)], user1);
      const after24 = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);

      const before72 = after24;
      simnet.callPublicFn(CONTRACT, "pin-message", [Cl.uint(1), Cl.uint(PIN_72_BLOCKS)], user2);
      const after72 = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);

      expect(after72 - before72).toBeGreaterThan(after24 - before24);
    });
  });

  describe("Reply chain integrity", () => {
    it("reply-to field correctly encodes parent ID", () => {
      postMsg("Parent", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("Reply")], user1);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(1)], user1);
      const msg = Cl.prettyPrint(result);
      // reply-to stores parent-id + 1, so parent 0 => reply-to: u1
      expect(msg).toContain("reply-to: u1");
    });

    it("get-reply-parent correctly decodes parent ID", () => {
      postMsg("Parent", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("Reply")], user1);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-reply-parent", [Cl.uint(1)], user1);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("non-reply message returns 0 from get-reply-parent", () => {
      postMsg("Not a reply", user1);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-reply-parent", [Cl.uint(0)], user1);
      // Non-reply has reply-to=0, so get-reply-parent returns 0
      expect(result).toBeOk(Cl.uint(0));
    });

    it("is-reply correctly identifies replies vs regular messages", () => {
      postMsg("Regular", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("Reply")], user1);

      expect(simnet.callReadOnlyFn(CONTRACT, "is-reply", [Cl.uint(0)], user1).result)
        .toBeOk(Cl.bool(false));
      expect(simnet.callReadOnlyFn(CONTRACT, "is-reply", [Cl.uint(1)], user1).result)
        .toBeOk(Cl.bool(true));
    });

    it("reply to a reply works (nested replies)", () => {
      postMsg("Root", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("Reply to root")], user2);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "reply-to-message",
        [Cl.uint(1), Cl.stringUtf8("Reply to reply")],
        user1
      );
      expect(result).toBeOk(Cl.uint(2));

      // Message 2 should have parent 1
      expect(simnet.callReadOnlyFn(CONTRACT, "get-reply-parent", [Cl.uint(2)], user1).result)
        .toBeOk(Cl.uint(1));
    });
  });

  describe("Deletion cascading behavior", () => {
    it("deleting a parent does NOT delete replies", () => {
      postMsg("Parent to delete", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("Reply lives")], user2);

      // Delete parent
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      // Reply should still exist and NOT be deleted
      const { result } = simnet.callReadOnlyFn(CONTRACT, "is-message-deleted", [Cl.uint(1)], user1);
      expect(result).toEqual(Cl.bool(false));
    });

    it("cannot edit a deleted message", () => {
      postMsg("Will delete", user1);
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(
        CONTRACT,
        "edit-message",
        [Cl.uint(0), Cl.stringUtf8("Too late")],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_DELETED));
    });

    it("cannot pin a deleted message", () => {
      postMsg("Will delete", user1);
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(
        CONTRACT,
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24_BLOCKS)],
        user1
      );
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_DELETED));
    });

    it("cannot react to a deleted message (normal)", () => {
      postMsg("Will delete", user1);
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(CONTRACT, "react-to-message", [Cl.uint(0)], user2);
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_DELETED));
    });

    it("cannot react to a deleted message (typed)", () => {
      postMsg("Will delete", user1);
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callPublicFn(
        CONTRACT,
        "react-to-message-typed",
        [Cl.uint(0), Cl.uint(2)],
        user2
      );
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_DELETED));
    });

    it("cannot reply to a deleted message", () => {
      postMsg("Will delete", user1);
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      simnet.mineEmptyBlocks(MIN_POST_GAP);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "reply-to-message",
        [Cl.uint(0), Cl.stringUtf8("Reply to dead")],
        user2
      );
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_DELETED));
    });

    it("soft delete preserves message data for audit trail", () => {
      postMsg("Audit trail message", user1);
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      expect(result).toBeDefined();
      const msg = Cl.prettyPrint(result);
      expect(msg).toContain("deleted: true");
      expect(msg).toContain('content: u"Audit trail message"');
    });
  });

  describe("Typed reactions edge cases", () => {
    it("all 5 reaction types are accepted", () => {
      // Different users react to the same message with different types
      postMsg("Multi-react", user1);

      for (let rtype = 1; rtype <= 5; rtype++) {
        const sender = accounts.get(`wallet_${rtype}`)!;
        const { result } = simnet.callPublicFn(
          CONTRACT,
          "react-to-message-typed",
          [Cl.uint(0), Cl.uint(rtype)],
          sender
        );
        expect(result).toBeOk(Cl.bool(true));
      }
    });

    it("reaction counts are tracked independently per type", () => {
      postMsg("Count reactions", user1);
      simnet.callPublicFn(CONTRACT, "react-to-message-typed", [Cl.uint(0), Cl.uint(1)], user2); // like
      simnet.callPublicFn(CONTRACT, "react-to-message-typed", [Cl.uint(0), Cl.uint(2)], user3); // fire
      simnet.callPublicFn(CONTRACT, "react-to-message-typed", [Cl.uint(0), Cl.uint(1)], user4); // like

      const { result: likes } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-reaction-count-by-type",
        [Cl.uint(0), Cl.uint(1)],
        user1
      );
      expect(likes).toEqual(Cl.uint(2));

      const { result: fires } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-reaction-count-by-type",
        [Cl.uint(0), Cl.uint(2)],
        user1
      );
      expect(fires).toEqual(Cl.uint(1));

      // Unreacted type should be 0
      const { result: sad } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-reaction-count-by-type",
        [Cl.uint(0), Cl.uint(4)],
        user1
      );
      expect(sad).toEqual(Cl.uint(0));
    });

    it("user can only react once regardless of type", () => {
      postMsg("One reaction", user1);
      simnet.callPublicFn(CONTRACT, "react-to-message-typed", [Cl.uint(0), Cl.uint(1)], user2);

      // Same user, different type = still rejected
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "react-to-message-typed",
        [Cl.uint(0), Cl.uint(3)],
        user2
      );
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_REACTED));
    });

    it("react-to-message and react-to-message-typed share the same reaction slot", () => {
      postMsg("Cross-type", user1);
      simnet.callPublicFn(CONTRACT, "react-to-message", [Cl.uint(0)], user2);

      // Typed reaction from same user should fail
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "react-to-message-typed",
        [Cl.uint(0), Cl.uint(2)],
        user2
      );
      expect(result).toBeErr(Cl.uint(ERR_ALREADY_REACTED));
    });
  });

  describe("Edit history integrity", () => {
    it("edit history preserves all previous versions", () => {
      postMsg("Version 0", user1);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("Version 1")], user1);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("Version 2")], user1);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("Version 3")], user1);

      // Edit 0 = original content
      const { result: h0 } = simnet.callReadOnlyFn(
        CONTRACT, "get-edit-history", [Cl.uint(0), Cl.uint(0)], user1
      );
      expect(Cl.prettyPrint(h0)).toContain('previous-content: u"Version 0"');

      // Edit 1 = version 1
      const { result: h1 } = simnet.callReadOnlyFn(
        CONTRACT, "get-edit-history", [Cl.uint(0), Cl.uint(1)], user1
      );
      expect(Cl.prettyPrint(h1)).toContain('previous-content: u"Version 1"');

      // Edit 2 = version 2
      const { result: h2 } = simnet.callReadOnlyFn(
        CONTRACT, "get-edit-history", [Cl.uint(0), Cl.uint(2)], user1
      );
      expect(Cl.prettyPrint(h2)).toContain('previous-content: u"Version 2"');

      // Current message content should be Version 3
      const { result: current } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      expect(Cl.prettyPrint(current)).toContain('content: u"Version 3"');
    });

    it("edit-count on message matches actual edits", () => {
      postMsg("Track edits", user1);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("E1")], user1);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("E2")], user1);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      const msg = Cl.prettyPrint(result);
      expect(msg).toContain("edit-count: u2");
      expect(msg).toContain("edited: true");
    });

    it("non-existent edit history entry returns none", () => {
      postMsg("No edits", user1);
      const { result } = simnet.callReadOnlyFn(
        CONTRACT, "get-edit-history", [Cl.uint(0), Cl.uint(0)], user1
      );
      expect(result).toBeNone();
    });
  });

  describe("Event logging verification", () => {
    it("post-message emits correct event", () => {
      const { events } = postMsg("Event test", user1);
      const printEvents = events.filter((e: any) => e.event === "print_event");
      expect(printEvents.length).toBeGreaterThan(0);
      
      const payload = Cl.prettyPrint(printEvents[0].data.value);
      expect(payload).toContain('"message-posted"');
      expect(payload).toContain("message-id: u0");
    });

    it("delete-message emits correct event", () => {
      postMsg("Delete event test", user1);
      const { events } = simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);
      const printEvents = events.filter((e: any) => e.event === "print_event");
      
      const payload = Cl.prettyPrint(printEvents[0].data.value);
      expect(payload).toContain('"message-deleted"');
    });

    it("edit-message emits correct event with edit number", () => {
      postMsg("Edit event test", user1);
      const { events } = simnet.callPublicFn(
        CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("Edited")], user1
      );
      const printEvents = events.filter((e: any) => e.event === "print_event");
      
      const payload = Cl.prettyPrint(printEvents[0].data.value);
      expect(payload).toContain('"message-edited"');
      expect(payload).toContain("edit-number: u1");
    });
  });

  describe("Global counter consistency", () => {
    it("total-messages tracks posts + replies", () => {
      postMsg("Post 1", user1);
      postMsg("Post 2", user2);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("Reply")], user1);

      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-total-messages", [], user1);
      expect(result).toBeOk(Cl.uint(3)); // 2 posts + 1 reply
    });

    it("total-deleted only counts deletions", () => {
      postMsg("Del 1", user1);
      postMsg("Keep", user2);
      simnet.callPublicFn(CONTRACT, "delete-message", [Cl.uint(0)], user1);

      expect(simnet.callReadOnlyFn(CONTRACT, "get-total-deleted", [], user1).result)
        .toBeOk(Cl.uint(1));
      expect(simnet.callReadOnlyFn(CONTRACT, "get-total-messages", [], user1).result)
        .toBeOk(Cl.uint(2)); // includes deleted
    });

    it("total-edits tracks all edits across messages", () => {
      postMsg("A", user1);
      postMsg("B", user2);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("A1")], user1);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(1), Cl.stringUtf8("B1")], user2);
      simnet.callPublicFn(CONTRACT, "edit-message", [Cl.uint(0), Cl.stringUtf8("A2")], user1);

      expect(simnet.callReadOnlyFn(CONTRACT, "get-total-edits", [], user1).result)
        .toBeOk(Cl.uint(3));
    });

    it("total-replies tracks reply count globally", () => {
      postMsg("Root", user1);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("R1")], user2);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("R2")], user1);

      expect(simnet.callReadOnlyFn(CONTRACT, "get-total-replies", [], user1).result)
        .toBeOk(Cl.uint(2));
    });

    it("message-nonce equals total messages posted (including replies)", () => {
      postMsg("A", user1);
      postMsg("B", user2);
      simnet.mineEmptyBlocks(MIN_POST_GAP);
      simnet.callPublicFn(CONTRACT, "reply-to-message", [Cl.uint(0), Cl.stringUtf8("R")], user1);

      const { result: nonce } = simnet.callReadOnlyFn(CONTRACT, "get-message-nonce", [], user1);
      const { result: total } = simnet.callReadOnlyFn(CONTRACT, "get-total-messages", [], user1);
      expect(nonce).toEqual(total);
    });
  });

  describe("Unicode and special content", () => {
    it("handles emoji content", () => {
      const { result } = postMsg("Hello 🌍🚀", user1);
      expect(result).toBeOk(Cl.uint(0));

      const { result: msg } = simnet.callReadOnlyFn(CONTRACT, "get-message", [Cl.uint(0)], user1);
      expect(Cl.prettyPrint(msg)).toContain("Hello");
    });

    it("handles CJK characters", () => {
      const { result } = postMsg("你好世界", user1);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("handles single character message", () => {
      const { result } = postMsg("a", user1);
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("Withdraw-fees edge cases", () => {
    it("can withdraw to a different principal than owner", () => {
      postMsg("Fees", user1);

      const { result } = simnet.callPublicFn(
        CONTRACT,
        "withdraw-fees",
        [Cl.uint(FEE_POST), Cl.principal(user2)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects zero-amount withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "withdraw-fees",
        [Cl.uint(0), Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(ERR_INVALID_INPUT));
    });

    it("multiple partial withdrawals work correctly", () => {
      const contractId = `${deployer}.${CONTRACT}`;
      postMsg("Fees", user1);

      simnet.callPublicFn(CONTRACT, "withdraw-fees", [Cl.uint(3000), Cl.principal(deployer)], deployer);
      simnet.callPublicFn(CONTRACT, "withdraw-fees", [Cl.uint(3000), Cl.principal(deployer)], deployer);

      const remaining = Number(simnet.getAssetsMap().get("STX")?.get(contractId) || 0);
      expect(remaining).toBe(FEE_POST - 6000);

      // Third withdrawal of 5000 should fail (only 4000 left)
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "withdraw-fees",
        [Cl.uint(5000), Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(ERR_INSUFFICIENT_BAL));
    });
  });
});
