import { Bool } from "./Bool";
import { Option } from "./Option";
import { Ok } from "./Result";

export interface Account {
  id: number;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function getNormalAccount(): Option<Account> {
  return new Option({ id: 1, isAdmin: false, isSuperAdmin: false });
}
export function getAdminAccount(): Option<Account> {
  return new Option({ id: 1, isAdmin: true, isSuperAdmin: false });
}

export function getSuperAdminAccount(): Option<Account> {
  return new Option({ id: 2, isAdmin: true, isSuperAdmin: true });
}

export function getNotFoundAccount(): Option<Account> {
  return new Option(null);
}

export function doAdminThings(account: Account): Account {
  console.log("doing admin things");
  return account;
}

export function doSuperAdminThings(account: Account): Account {
  console.log("doing super admin things");
  return account;
}

const doAdminThingsSpy = jest.fn(doAdminThings);
const doSuperAdminThingsSpy = jest.fn(doSuperAdminThings);

describe("test", () => {
  beforeEach(() => {
    doAdminThingsSpy.mockClear();
    doSuperAdminThingsSpy.mockClear();
  });

  describe("imperative code", () => {
    const doImperativeTest = (getAccountFn: () => Option<Account>) => {
      const maybeAccount = getAccountFn();
      if (maybeAccount.isNone()) {
        throw new Error("Account not found");
      }
      const account = maybeAccount.unwrap();

      if (!account.isAdmin) {
        throw new Error("User does not have permission to do admin things");
      }
      doAdminThingsSpy(account);

      if (!account.isSuperAdmin) {
        throw new Error(
          "User does not have permission to do super admin things"
        );
      }
      doSuperAdminThingsSpy(account);
    };

    it("account not found", () => {
      expect(() => {
        doImperativeTest(getNotFoundAccount);
      }).toThrowError("Account not found");
      expect(doAdminThingsSpy).not.toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).not.toHaveBeenCalled();
    });

    it("normal account", () => {
      expect(() => {
        doImperativeTest(getNormalAccount);
      }).toThrowError("User does not have permission to do admin things");
      expect(doAdminThingsSpy).not.toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).not.toHaveBeenCalled();
    });

    it("admin account", () => {
      expect(() => {
        doImperativeTest(getAdminAccount);
      }).toThrowError("User does not have permission to do super admin things");
      expect(doAdminThingsSpy).toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).not.toHaveBeenCalled();
    });

    it("super admin account", () => {
      expect(() => doImperativeTest(getSuperAdminAccount)).not.toThrowError();
      expect(doAdminThingsSpy).toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).toHaveBeenCalled();
    });
  });

  describe("functional code", () => {
    const doFunctionalTest = (getAccountFn: () => Option<Account>) => {
      // This code has 25% less SLOC, even despite the awkwardness of mapping booleans.
      getAccountFn() // maybe we have an account
        .okOr("Account not found") // short circuit everything if we don't.
        .andThen((account) => {
          return new Bool(account.isAdmin)
            .then(() => doAdminThingsSpy(account)) // this only runs if we're an admin
            .okOr("User does not have permission to do admin things");
        })
        .andThen((account) => {
          return new Bool(account.isSuperAdmin)
            .then(() => doSuperAdminThingsSpy(account)) // this only runs if we're a super admin
            .okOr("User does not have permission to do super admin things");
        })
        .unwrap();
    };

    it("account not found", () => {
      expect(() => {
        doFunctionalTest(getNotFoundAccount);
      }).toThrowError("Account not found");
      expect(doAdminThingsSpy).not.toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).not.toHaveBeenCalled();
    });

    it("normal account", () => {
      expect(() => {
        doFunctionalTest(getNormalAccount);
      }).toThrowError("User does not have permission to do admin things");
      expect(doAdminThingsSpy).not.toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).not.toHaveBeenCalled();
    });

    it("admin account", () => {
      expect(() => {
        doFunctionalTest(getAdminAccount);
      }).toThrowError("User does not have permission to do super admin things");
      expect(doAdminThingsSpy).toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).not.toHaveBeenCalled();
    });

    it("super admin account", () => {
      expect(() => doFunctionalTest(getSuperAdminAccount)).not.toThrowError();
      expect(doAdminThingsSpy).toHaveBeenCalled();
      expect(doSuperAdminThingsSpy).toHaveBeenCalled();
    });
  });
});

describe("ROP comparison", () => {
  const handleMessage = jest.fn();
  const log = {
    debug: jest.fn(),
    error: jest.fn(),
  };
  const isClientMsg = jest.fn();

  describe("signaling message handler", () => {
    // Part of the Studio signaling server message handling code (some details
    // changed slightly)
    const realSignalingMessageHandler = (ws: any, message: any) => {
      log.debug("Received a message");
      try {
        if (!message.byteLength) {
          throw new Error("Received empty message");
        }

        log.debug("Parsing message");
        const clientMsg = JSON.parse(message.payload);
        log.debug("Got:", clientMsg);
        if (!isClientMsg(clientMsg)) {
          throw new Error("Not a client message");
        }

        handleMessage(ws, clientMsg);
      } catch (e) {
        log.error(e);
      }
    };

    // Functionally the same, but rewritten to use ROP.
    const ropSignalingMessageHandler = (ws: any, message: any) => {
      log.debug("Received a message");
      new Bool(message.byteLength)
        .okOr("Received empty message")
        .andThen(() => Ok(log.debug("Parsing message")))
        .andThen(() => Ok(JSON.parse(message.payload)))
        .andThen((msg) =>
          new Bool(isClientMsg(msg)).thenSome(msg).okOr("Not a client message")
        )
        .andThen((msg) => Ok(handleMessage(ws, msg)))
        .orElse((e) => log.error(e));
    };

    it("should throw an error if byteLength is falsy", () => {
      realSignalingMessageHandler(null, { byteLength: 0 });
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Received empty message",
        })
      );

      ropSignalingMessageHandler(null, { byteLength: 0 });
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Received empty message",
        })
      );
    });

    it("should throw an error if not a client message", () => {
      isClientMsg.mockReturnValueOnce(false).mockReturnValueOnce(false);

      realSignalingMessageHandler(null, {
        byteLength: 1,
        payload: `{"foo":"bar"}`,
      });
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not a client message",
        })
      );

      ropSignalingMessageHandler(null, {
        byteLength: 1,
        payload: `{"foo":"bar"}`,
      });
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not a client message",
        })
      );
    });

    it("should call handleMessage", () => {
      isClientMsg.mockReturnValueOnce(true).mockReturnValueOnce(true);
      handleMessage.mockClear();

      realSignalingMessageHandler(null, {
        byteLength: 1,
        payload: `{"foo":"bar"}`,
      });
      expect(handleMessage).toHaveBeenCalledWith(null, { foo: "bar" });
      handleMessage.mockClear();

      ropSignalingMessageHandler(null, {
        byteLength: 1,
        payload: `{"foo":"bar"}`,
      });
      expect(handleMessage).toHaveBeenCalledWith(null, { foo: "bar" });
    });
  });
});
