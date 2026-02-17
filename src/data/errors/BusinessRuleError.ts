import { BaseError } from './baseError'

export class BusinessRuleError extends BaseError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'BusinessRuleError'
  }
}
