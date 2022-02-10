import { Option } from "./Option";
import { Err, Ok, Result } from "./Result";

const gotAccount = getAccount().expect("Account not found");

// Booleans aren't natively monadic in typescript - but we can wrap them to
// make them so.
new Bool(gotAccount.isAdmin)
  .then(() => doAdminThings(gotAccount))
  .okOr("User does not have permission to do admin things");

//   .andThen((a) => {
//     // if we do...
//     doAdminThings(a); // do admin things.
//     return new Bool(a.isSuperAdmin).okOr(
//       "User does not have permission to do super admin things"
//     );
//   })
//   .andThen((a) => doSuperAdminThings(a));

// Now that's better than the corresponding imperative code
const maybeAccount = getAccount();
if (maybeAccount.isNone()) {
  throw new Error("Account not found");
}
const account = maybeAccount.unwrap();

if (!account.isAdmin) {
  throw new Error("User does not have permission to do admin things");
}
doAdminThings(account);

if (!account.isSuperAdmin) {
  throw new Error("User does not have permission to do super admin things");
}
doSuperAdminThings(account);
