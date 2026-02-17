import { ValidationError } from 'yup'

export abstract class BaseError extends ValidationError {
  private statusCode: number

  constructor(message: string, statusCode: number) {
    super(message, null, '')
    this.statusCode = statusCode
    this.name = this.constructor.name
    this.message = message
  }

  getStatusCode(): number {
    return this.statusCode
  }
}
