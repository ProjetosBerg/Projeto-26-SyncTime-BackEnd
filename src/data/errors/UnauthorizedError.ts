import { BaseError } from "./baseError";

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
