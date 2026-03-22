export class OperatorSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperatorSessionError";
  }
}

export class OperatorAccountConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperatorAccountConflictError";
  }
}
