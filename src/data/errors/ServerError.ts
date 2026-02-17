import { BaseError } from './baseError'

export class ServerError extends BaseError {
  constructor(message: string) {
    super(message, 500)
    this.name = 'ServerError'
  }
}
