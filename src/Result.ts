export class Result<T, E> {
  constructor(private readonly t: T | null, private readonly e: E | null) {}

  public unwrap(): T {
    if (this.t === null) {
      throw new Error("Result is Err");
    }

    return this.t;
  }

  public isOk(): boolean {
    return this.t !== null;
  }

  public isErr(): boolean {
    return this.e !== null;
  }
}
