/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import { TransactionURI } from 'symbol-uri-scheme'
import {
  AggregateTransaction,
  MosaicInfo,
  PublicAccount,
  Transaction,
  TransactionMapping,
} from 'symbol-sdk'

// internal dependencies
import {
  AllowanceResult,
  AssetIdentifier,
  BaseCommand,
  CommandOption,
  Context,
  Symbol,
} from '../../../../index'
import { FailureEmptyContract } from '../../../errors/FailureEmptyContract'

/**
 * @abstract
 * @class Swapable.Executable
 * @package Swapable
 * @subpackage Commands
 * @since v1.0.0
 * @description Abstract class that describes a pool command
 *              for assets compliant with the automated pool
 *              standard as defined in this package. This is
 *              the base layer for the execution of commands.
 */
export abstract class Executable extends BaseCommand {
  /**
   * @access public
   * @description The deterministic public account which owns an
   *              automated liquidity pool. This account is used
   *              to issue the *automated pool shares* mosaic.
   */
  public target: PublicAccount

  /**
   * @access public
   * @description The list of **required** arguments to execute
   *              an automated pool command.
   */
  public arguments: string[] = []

  /**
   * @access public
   * @description Mosaic information for the network-wide created
   *              automated pool shares of an automated liquidity
   *              pool.
   */
  public mosaicInfo: MosaicInfo | undefined

  /**
   * Construct an executable command object around \a context
   * and an \a identifier of automated pool shares.
   *
   * @access public
   * @param   {Context}           context       The execution context.
   * @param   {AssetIdentifier}   identifier    The automated pool shares asset identifier.
   */
  public constructor(
    /**
     * @readonly
     * @access public
     * @description The execution context.
     */
    public readonly context: Context,

    /**
     * @readonly
     * @access public
     * @description The automated pool shares asset identifier.
     */
    protected readonly identifier: AssetIdentifier,
  ) {
    super(context)
    this.target = this.identifier.target
  }

  // region abstract methods
  /**
   * This method MUST return the automated pool command name,
   * e.g. "CreatePool" or "AddLiquidity", etc.
   *
   * @abstract
   * @access public
   * @return {string}
   **/
  public abstract get name(): string

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
   * @abstract
   * @access public
   * @return {string}
   **/
  public abstract get descriptor(): string

  /**
   * This method MUST return a list of unsigned transactions.
   * Transactions returned here will then be wrapped inside a
   * transaction URI in the `execute()` method.
   *
   * @see {execute()}
   * @abstract
   * @access public
   * @return  {AggregateTransaction[]}   Given the execution of a command, returns the resulting transactions list.
   **/
  protected abstract get transactions(): Transaction[]
  // end-region abstract methods

  /**
   * Verifies **allowance** of \a actor to execute a command
   * with arguments \a argv. By default, this method returns
   * true *only* if the actor is the automated pool's target
   * account.
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

    // - By default, only target can execute commands ("owner only")
    const isOperator = actor.address.equals(
      this.target.address
    )

    return new AllowanceResult(isOperator)
  }

  /**
   * Executes an automated pool command with \a actor given
   * \a argv command options.
   *
   * @access public
   * @param   {PublicAccount}           actor   The actor is whom executes the command.
   * @param   {Array<CommandOption>}    argv    The command options (arguments).
   * @return  {TransactionURI<T>}         Returns one transaction URI with all transactions.
   * @throws  {FailureMissingArgument}    On missing mandatory argument(s).
   * @throws  {FailureOperationForbidden} On denial of authorization.
   **/
  public execute(
    actor: PublicAccount,
    argv?: CommandOption[]
  ): TransactionURI<Transaction> {
    // - Verifies the authorization to execute
    super.assertExecutionAllowance(actor, argv)

    // - Creates a digital contract for this execution
    const contract = this.prepare()

    // - Formats the result as a transaction URI
    return new TransactionURI(contract.serialize(), TransactionMapping.createFromPayload)
  }

  /**
   * Wraps the resulting transactions inside an aggregate bonded
   * transaction. We will later refer to this transaction as the
   * **digital contract**.
   *
   * Prior to announcing this digital contract to a network, and
   * waiting for it to be included in a new block, you must also
   * announce a HashLockTransaction to allow the use of contracts.
   *
   * @link https://docs.symbolplatform.com/serialization/lock_hash.html#hash-lock-transaction
   * @link https://docs.symbolplatform.com/concepts/aggregate-transaction.html#id3
   *
   * @access protected
   * @return  {AggregateTransaction} Aggregate bonded transaction
   * @throws  {FailureEmptyContract} Given a misconfigured digital contract which is empty.
   **/
  protected prepare(): AggregateTransaction | Transaction {
    // - Sanity check
    if (!this.transactions.length) {
      throw new FailureEmptyContract('No transactions result from the execution of this contract.')
    }

    // - Shortcut for network information
    const reader = this.context.reader as Symbol.Reader

    // - Creates a so-called digital contract
    return AggregateTransaction.createBonded(
      this.context.parameters.deadline,
      this.transactions,
      reader.networkType,
      [], // "unsigned"
      this.context.parameters.maxFee,
    )
  }
}
