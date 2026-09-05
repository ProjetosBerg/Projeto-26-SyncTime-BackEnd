export abstract class BaseError extends Error {
  private readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
  }

  getStatusCode(): number {
    return this.statusCode
  }
}
