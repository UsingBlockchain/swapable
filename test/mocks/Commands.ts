/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import { 
  AggregateTransaction,
  PublicAccount,
  Transaction,
  TransactionMapping,
} from 'symbol-sdk'
import { TransactionURI } from 'symbol-uri-scheme'

// internal dependencies
import {
  AllowanceResult,
  BaseCommand,
  CommandOption,
  Symbol,
} from '../../index'

export class FakeCommand extends BaseCommand {

  public get name(): string {
    return 'FakeCommand'
  }

  public get descriptor(): string {
    return 'SWAPS(' + this.context.revision + '):fake:0'
  }

  public async synchronize(): Promise<boolean> {
    return true
  }

  public canExecute(
    actor: PublicAccount,
    argv: CommandOption[] | undefined,
  ): AllowanceResult {
    return new AllowanceResult(true)
  }

  public execute(
    actor: PublicAccount,
    argv: CommandOption[] | undefined,
  ): TransactionURI<Transaction> {
    return new TransactionURI('', TransactionMapping.createFromPayload)
  }

  protected prepare(): AggregateTransaction | Transaction {
    return AggregateTransaction.createBonded(
      this.context.parameters.deadline,
      this.transactions,
      (this.context.reader as Symbol.Reader).networkType,
      [],
      this.context.parameters.maxFee,
    )
  }

  protected get transactions(): Transaction[] {
    return []
  }
}
