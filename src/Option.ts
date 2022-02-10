import { Result } from "./Result";

export class Option<T> {
  constructor(protected readonly t: T | null) {}

  public isSome(): boolean {
    return this.t !== null;
  }

  public isNone(): boolean {
    return this.t === null;
  }

  public unwrap(): T {
    if (this.t === null) {
      throw new Error("Option is None");
    }

    return this.t;
  }

  public expect<E>(error: E): T {
    if (this.t === null) {
      throw error;
    }

    return this.t;
  }

  public unwrapOr(defaultValue: T): T {
    return this.t ?? defaultValue;
  }

  public map<U>(f: (t: T) => U): Option<U> {
    if (this.t === null) {
      return new Option<U>(null);
    }

    return new Option<U>(f(this.t));
  }

  public mapOr<U>(defaultValue: U, f: (t: T) => U): U {
    return this.map(f).unwrapOr(defaultValue);
  }

  public okOr<E>(error: E): Result<T, E> {
    if (this.t === null) {
      return new Result<T, E>(null, error);
    }

    return new Result<T, E>(this.t, null);
  }

  public okOrElse<E>(f: () => E): Result<T, E> {
    if (this.t === null) {
      return new Result<T, E>(null, f());
    }

    return new Result<T, E>(this.t, null);
  }

  public and<U>(other: Option<U>): Option<U> {
    if (this.t === null) {
      return new Option<U>(null);
    }

    return other;
  }

  public andThen<U>(f: (t: T) => Option<U>): Option<U> {
    if (this.t === null) {
      return new Option<U>(null);
    }

    return f(this.t);
  }
}
