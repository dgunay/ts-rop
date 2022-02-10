export function Ok<T, E>(t: T): Result<T, E> {
  return new Result(t);
}

export function Err<T, E>(e: E): Result<T, E> {
  return new Result(null, e);
}

export class Result<T, E> {
  constructor(
    private readonly t: T | null,
    private readonly e: E | null = null
  ) {}

  public unwrap(): T {
    if (this.t === null) {
      throw this.e;
    }

    return this.t;
  }

  public unwrapOr(defaultValue: T): T {
    return this.t ?? defaultValue;
  }

  public expect(error: E): T {
    if (this.t === null) {
      throw error;
    }

    return this.t;
  }

  public isOk(): boolean {
    return this.t !== null;
  }

  public isErr(): boolean {
    return this.e !== null;
  }

  public map<U>(f: (t: T) => U): Result<U, E> {
    if (this.t === null) {
      return new Result<U, E>(null, this.e);
    }

    return new Result<U, E>(f(this.t), this.e);
  }

  public mapOr<U>(defaultValue: U, f: (t: T) => U): U {
    return this.map(f).unwrapOr(defaultValue);
  }

  public or(res: Result<T, E>): Result<T, E> {
    return this.isErr() ? res : this;
  }

  public and<U>(other: Result<U, E>): Result<U, E> {
    if (this.t === null) {
      return new Result<U, E>(null, this.e);
    }

    return other;
  }

  public andThen<U>(f: (t: T) => Result<U, E>): Result<U, E> {
    if (this.t === null) {
      return new Result<U, E>(null, this.e);
    }

    return f(this.t);
  }
}
