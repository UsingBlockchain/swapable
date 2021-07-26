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
} from 'symbol-sdk'
import { TransactionURI } from 'symbol-uri-scheme'

// internal dependencies
import {
  AllowanceResult,
  Command,
  CommandOption,
  Context,
  FailureOperationForbidden,
} from '../../index'
import { FailureMissingArgument } from '../errors/FailureMissingArgument'

/**
 * @class BaseCommand
 * @package Swapable
 * @subpackage Contracts
 * @since v1.0.0
 * @description Abstract class that describes a command interface for executing
 *              commands that involve swapable digital assets.
 */
export abstract class BaseCommand implements Command {
  /**
   * Construct a command object around `context`.
   *
   * @param {Context} context 
   */
  public constructor(
    /**
     * @description Execution context
     */
    public readonly context: Context,
  ) {}

  /// region abstract methods
  /**
   * Getter for the command name.
   *
   * @return {string}
   **/
  public abstract get name(): string

  /**
   * Getter for the command descriptor.
   *
   * @return {string}
   **/
  public abstract get descriptor(): string

  /**
   * Verifies **allowance** of `actor` to execute command. Arguments to
   * the command execution can be passed in `argv`.
   *
   * @param   {PublicAccount}                actor
   * @param   {Array<CommandOption>}   argv
   * @return  {AllowanceResult}
   **/
  public abstract canExecute(
    actor: PublicAccount,
    argv: CommandOption[] | undefined,
  ): AllowanceResult

  /**
   * Execute the command with `actor` operator account. Arguments to
   * the command execution can be passed in `argv`.
   *
   * @param   {PublicAccount}           actor
   * @param   {Array<CommandOption>}    argv
   * @return  {TransactionURI}
   **/
  public abstract execute(
    actor: PublicAccount,
    argv: CommandOption[] | undefined,
  ): TransactionURI<Transaction>

  /**
   * Prepare the command's transactions. Some commands may require
   * the atomic execution of all their transactions and therefor
   * need the prepare method to wrap transactions inside an aggregate
   * transaction.
   *
   * @param   {PublicAccount}         actor
   * @param   {Array<CommandOption>}   argv
   * @return  {TransactionURI}
   **/
  protected abstract prepare(): AggregateTransaction | Transaction

  /**
   * Build a command's transactions. Transactions returned here will
   * be formatted to a transaction URI in the `execute()` step.
   *
   * @return {Transaction}
   **/
  protected abstract get transactions(): Transaction[]
  /// end-region abstract methods

  /**
   * Asserts the allowance of `actor` to execute the command.
   *
   * @param {PublicAccount} actor 
   * @param {CommandOption[]} argv 
   * @throws {FailureOperationForbidden} On denial of authorization
   */
  protected assertExecutionAllowance(
    actor: PublicAccount,
    argv: CommandOption[] | undefined,
  ): boolean {
    // check that `actor` is allowed to execute
    const authResult = this.canExecute(actor, argv)
    if (!authResult.status) {
      throw new FailureOperationForbidden('Operation forbidden (' + this.name + ')')
    }

    return true
  }

  /**
   * Asserts the presence of `fields` in `argv`.
   *
   * @param {CommandOption[]} argv
   * @param {string[]} fields
   * @throws {FailureMissingArgument} On missing mandatory argument(s).
   */
  protected assertHasMandatoryArguments(
    argv: CommandOption[] | undefined,
    fields: string[]
  ): boolean {
    // check that all `fields` are present in context
    for (let i = 0, m = fields.length; i < m; i ++) {
      const value = this.context.getInput(fields[i], null)
      if (null === value) {
        throw new FailureMissingArgument('Missing argument "' + fields[i] + '"')
      }
    }

    return true
  }
}
