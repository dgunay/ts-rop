import { Result, Ok, Err } from "../Result";

function mayFail(): Result<string, string> {
  return Ok("ok");
}

function mayAlsoFail(): Result<string, string> {
  return Err("oops");
}

function chainOperations() {
  // "and" lets us to build short-circuit evaluation of failure-prone operations
  // "or" lets us declaratively handle failure (specific errors for each stage)
  mayFail()
    .or(Err("first error"))
    .and(mayAlsoFail().or(Err("second error")))
    .orElse((e) => Err(console.error(e)));
}

function imperativeChainOperations() {
  try {
    mayFail().unwrap();
    mayAlsoFail().unwrap();
  } catch (e) {
    // Checking error types is not elegant
    if (e instanceof Error) {
      console.error(e);
    }

    throw e;
  }
}
