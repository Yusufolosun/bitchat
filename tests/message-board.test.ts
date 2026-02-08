import { describe, expect, it } from "vitest";

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
        "message-board",
        "post-message",
        [Cl.stringUtf8("Hello Bitchat!")],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });

    it("rejects message that is too short", () => {
      const { result } = simnet.callPublicFn(
        "message-board",
        "post-message",
        [Cl.stringUtf8("")],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });

    it("accepts message at maximum length (280 chars)", () => {
      const maxMessage = "a".repeat(280);
      const { result } = simnet.callPublicFn(
        "message-board",
        "post-message",
        [Cl.stringUtf8(maxMessage)],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });

    it("increments message nonce correctly", () => {
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("First")], user1);
      const { result } = simnet.callPublicFn(
        "message-board",
        "post-message",
        [Cl.stringUtf8("Second")],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(1));
    });

    it("transfers posting fee to contract", () => {
      const contractId = `${deployer}.message-board`;
      const initialBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      
      simnet.callPublicFn(
        "message-board",
        "post-message",
        [Cl.stringUtf8("Test message")],
        user1
      );
      
      const finalBalance = simnet.getAssetsMap().get("STX")?.get(contractId) || 0;
      expect(finalBalance - initialBalance).toBe(FEE_POST_MESSAGE);
    });

    it("updates total fees collected", () => {
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board",
        "get-total-fees-collected",
        [],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(FEE_POST_MESSAGE));
    });

    it("creates user stats on first post", () => {
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("First post")], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board",
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
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("First")], user1);
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("Second")], user1);
      
      const { result } = simnet.callReadOnlyFn(
        "message-board",
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
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("My message")], user1);
      
      // Then pin it (24 hours = 144 blocks)
      const { result } = simnet.callPublicFn(
        "message-board",
        "pin-message",
        [Cl.uint(0), Cl.uint(144)],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects pin attempt by non-author", () => {
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("User1 message")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board",
        "pin-message",
        [Cl.uint(0), Cl.uint(144)],
        user2 // Different user trying to pin
      );
      
      expect(result).toBeErr(Cl.uint(102)); // err-unauthorized
    });

    it("rejects pin for non-existent message", () => {
      const { result } = simnet.callPublicFn(
        "message-board",
        "pin-message",
        [Cl.uint(999), Cl.uint(144)],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });

    it("accepts 24-hour pin duration", () => {
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_24HR_BLOCKS)],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("accepts 72-hour pin duration", () => {
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board",
        "pin-message",
        [Cl.uint(0), Cl.uint(PIN_72HR_BLOCKS)],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects invalid pin duration", () => {
      simnet.callPublicFn("message-board", "post-message", [Cl.stringUtf8("Test")], user1);
      
      const { result } = simnet.callPublicFn(
        "message-board",
        "pin-message",
        [Cl.uint(0), Cl.uint(100)], // Invalid duration
        user1
      );
      
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-input
    });
  });
});
