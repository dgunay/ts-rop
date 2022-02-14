import { Option } from "./Option";
import { Result } from "./Result";

// A semi-monadic boolean wrapper class
export class Bool {
  constructor(private readonly b: boolean) {}

  public isTrue(): boolean {
    return this.b;
  }

  public isFalse(): boolean {
    return !this.b;
  }

  public thenSome<T>(t: T): Option<T> {
    return this.b ? new Option(t) : new Option(null);
  }

  // Runs f if b is true, otherwise returns None
  public then<T>(f: () => T): Option<T> {
    return this.b ? new Option(f()) : new Option(null);
  }

  public and<T>(other: Bool): Bool {
    return this.b ? other : new Bool(false);
  }

  public andThen<T>(f: () => T): Option<T> {
    return this.b ? new Option(f()) : new Option(null);
  }

  public okOr<E>(error: E): Result<boolean, E> {
    return this.b ? new Result(true) : new Result(false, error);
  }
}
