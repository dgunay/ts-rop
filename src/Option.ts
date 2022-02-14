import { Result } from "./Result";

export function some<T>(t: T): Option<T> {
  return new Option(t);
}

export function none<T>(): Option<T> {
  return new Option(null);
}

export class Option<T> {
  constructor(protected readonly t: T | null = null) {}

  public isSome(): boolean {
    return this.t !== null;
  }

  public isNone(): boolean {
    return this.t === null;
  }

  // Return the inner value or throw a generic error if the Option is None
  public unwrap(): T {
    if (this.t === null) {
      throw new Error("Option is None");
    }

    return this.t;
  }

  // Return the inner value or throw a custom error if the Option is None
  public expect<E>(error: E): T {
    if (this.t === null) {
      throw error;
    }

    return this.t;
  }

  // Return the inner value or return a provided default.
  public unwrapOr(defaultValue: T): T {
    return this.t ?? defaultValue;
  }

  // If the inner T is some, run a function that maps it into a U. Otherwise, return None.
  public map<U>(f: (t: T) => U): Option<U> {
    if (this.t === null) {
      return none();
    }

    return some(f(this.t));
  }

  // If the inner T is some, run a function that maps it into a U. Otherwise, return
  // a default value.
  public mapOr<U>(defaultValue: U, f: (t: T) => U): U {
    return this.map(f).unwrapOr(defaultValue);
  }

  // Return an Ok if the inner value is Some, otherwise return an Err.
  public okOr<E>(error: E): Result<T, E> {
    if (this.t === null) {
      return new Result<T, E>(null, error);
    }

    return new Result<T, E>(this.t, null);
  }

  // Return the inner Ok value or run a function that returns an Err.
  public okOrElse<E>(f: () => E): Result<T, E> {
    if (this.t === null) {
      return new Result<T, E>(null, f());
    }

    return new Result<T, E>(this.t, null);
  }

  // Return `other` or none if this is None.
  public and<U>(other: Option<U>): Option<U> {
    if (this.t === null) {
      return none();
    }

    return other;
  }

  // Run f on this Some value or return None if this is None.
  public andThen<U>(f: (t: T) => Option<U>): Option<U> {
    if (this.t === null) {
      return none();
    }

    return f(this.t);
  }
}
