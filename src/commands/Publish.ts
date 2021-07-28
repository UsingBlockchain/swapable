/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
 import {
  InnerTransaction,
  PublicAccount,
  Transaction,
  TransferTransaction,
  PlainMessage,
} from 'symbol-sdk'

// internal dependencies
import {
  AllowanceResult,
  CommandOption,
  Symbol,
} from '../../index'
import { Executable } from './Executable'

/**
 * @class Swapable.Publish
 * @package Swapable
 * @subpackage Commands
 * @since v1.0.0
 * @description Class that describes a command for publishing
 *              automated liquidity pools to a registry.
 * @summary
 * This automated pool command accepts the following arguments:
 *
 * | Argument | Description | Example |
 * | --- | --- | --- |
 * | registry | Liquidity pool registry | `new PublicAccount(...)` |
 *
 * The execution of this command results in the creation of
 * the following list of transactions with their respective
 * *signer* and a description:
 *
 * | Sequence | Type | Signer | Description |
 * | --- | --- | --- | --- |
 * | 01 | TransferTransaction | Target Account | Creates a registration contract with a signature that contains the token identifier. |
 *
 */
export class Publish extends Executable {
  /**
   * @access public
   * @description The list of **required** arguments to execute
   *              *this* automated pool command.
   */
  public arguments: string[] = [
    'registry',
  ]

  /**
   * Verifies **allowance** of \a actor to execute a command
   * with arguments \a argv. This method returns true if all
   * required arguments are present.
   *
   * This method asserts the presence of mandatory arguments.
   *
   * @access public
   * @param   {PublicAccount}           actor   The actor is whom executes the command.
   * @param   {Array<CommandOption>}    argv    The command options (arguments).
   * @return  {AllowanceResult}         Returns whether an actor is authorized to execute this command.
   * @throws  {FailureMissingArgument}  On missing mandatory argument(s).
   **/
  public canExecute(
    actor: PublicAccount,
    argv?: CommandOption[]
  ): AllowanceResult {
    // - Asserts the presence of mandatory inputs
    super.assertHasMandatoryArguments(argv, this.arguments)

    // - Allows only the target account of liquidity
    //   pools to publish a pool to a registry.
    return new AllowanceResult(
      actor.address.equals(this.target.address)
    )
  }

  // region abstract methods
  /**
   * This method returns the automated pool command name,
   * e.g. "Publish" or "AddLiquidity", etc.
   *
   * @access public
   * @return {string}
   **/
  public get name(): string {
    return 'Publish'
  }

  /**
   * This method MUST return a unique automated pool command
   * descriptor which includes:
   *
   * - the open standard descriptor (e.g.: "Swapable") ;
   * - the open standard *revision* (e.g.: 1) ;
   * - the kebab-case command name (e.g.: "create-pool") ;
   * - and the automated pool shares asset identifier.
   *
   * Items are joined with the `:` operator and attached to a
   * so-called execution proof transaction.
   *
   * @access public
   * @return {string}
   **/
  public get descriptor(): string {
    return 'Swapable(v' + this.context.revision + ')' + ':publish:' + this.identifier.id
  }

  /**
   * This method returns a list of unsigned transactions in a
   * sequencial order of execution. The resulting transaction
   * array is later wrapped inside a digital contract that is
   * executed atomically such that either all transactions do
   * succeed or all transactions are cancelled.
   *
   * :warning: This method creates at least one- or more than
   * one - network-wide **account restriction**. Restrictions
   * can potentially lock you out of your account, please use
   * this only with caution and if you understand the risks.
   *
   * @see {execute()}
   * @access public
   * @return  {Transaction[]}   Given the execution of a command, returns a list of unsigned transactions.
   **/
  protected get transactions(): Transaction[] {
    // - Reads the execution context
    const reader = this.context.reader as Symbol.Reader

    // - Read external arguments
    const registry = this.context.getInput('registry', new PublicAccount())

    // - Prepares the response
    const transactions: InnerTransaction[] = []
    const signers: PublicAccount[] = []

    // - Transaction 01: Add execution proof transaction
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      registry.address,
      [], // no mosaics
      PlainMessage.create(this.descriptor),
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 10 is issued by **provider** account ("the actor")
    signers.push(this.target)

    // - Assigns correct signer to each transaction
    return transactions.map(
      (transaction, i) => transaction.toAggregate(signers[i])
    )
  }
  // end-region abstract methods
}
