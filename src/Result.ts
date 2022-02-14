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

  // Return the Ok value or throw a generic error if the Result is Err
  public unwrap(): T {
    if (this.t === null) {
      throw this.e;
    }

    return this.t;
  }

  // Return the Ok value or a default value if the Result is Err
  public unwrapOr(defaultValue: T): T {
    return this.t ?? defaultValue;
  }

  // Return an Ok if the inner value is Some, otherwise throw a provided error
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

  // Map inner T to U if the Result is Ok, otherwise return Err
  public map<U>(f: (t: T) => U): Result<U, E> {
    if (this.isErr()) {
      return Err(this.e);
    }

    return Ok(f(this.t));
  }

  // Map inner T to U if the Result is Ok, otherwise return `defaultValue`
  public mapOr<U>(defaultValue: U, f: (t: T) => U): U {
    return this.map(f).unwrapOr(defaultValue);
  }

  // Return this if this is Ok, otherwise return `res`
  public or(res: Result<T, E>): Result<T, E> {
    return this.isErr() ? res : this;
  }

  // Return this if this is Err, otherwise return `other`
  public and<U>(other: Result<U, E>): Result<U, E> {
    if (this.isErr()) {
      return Err(this.e);
    }

    return other;
  }

  // Return this if this is Err, otherwise run f on the inner value
  public andThen<U>(f: (t: T) => Result<U, E>): Result<U, E> {
    if (this.isErr()) {
      return Err(this.e);
    }

    return f(this.t);
  }

  // Return the inner value if Ok, otherwise run f on the inner Err
  public orElse<F>(f: (e: E) => Result<T, F>): Result<T, F | E> {
    return this.isErr() ? f(this.e) : this;
  }
}
