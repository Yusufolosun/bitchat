import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

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
      
      expect(result).toBeOk(Cl.uint(1)); // Second message gets ID 1
    });
  });
});
