import { BaseError } from './baseError'

export class InvalidResourceError extends BaseError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'InvalidResource'
  }
}
