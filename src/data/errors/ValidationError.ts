import { BaseError } from './baseError'

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 404)
    this.name = 'ValidationError'
  }
}
