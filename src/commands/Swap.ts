/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import {
  InnerTransaction,
  PublicAccount,
  Transaction,
  TransferTransaction,
  PlainMessage,
  UInt64,
  Mosaic,
  EmptyMessage,
} from 'symbol-sdk'

// internal dependencies
import {
  AllowanceResult,
  AssetAmount,
  AssetIdentifier,
  CommandOption,
  Symbol,
} from '../../index'
import { Executable } from './Executable'

//XXX remove this, used only for type-discovery in command options below.
const Symbol_Testnet_SWP = new AssetIdentifier('00000001', new PublicAccount())
const Symbol_Testnet_XYM = new AssetIdentifier('00000002', new PublicAccount())

/**
 * @class Swapable.Swap
 * @package Swapable
 * @subpackage Commands
 * @since v1.0.0
 * @description Class that describes a command for swapping assets
 *              in automated liquidity pools (i.e. "swap").
 * @summary
 * This automated pool command accepts the following arguments:
 *
 * | Argument | Description | Example |
 * | --- | --- | --- |
 * | trader | Trader | `new PublicAccount(...)` |
 * | input_x | Amount and asset identifier of `x` (first in pair) | `new AssetAmount(...)` |
 * | output | Asset identifier of `y` (second in pair). | `new AssetIdentifier(...)` |
 *
 * The execution of this command results in the creation of
 * the following list of transactions with their respective
 * *signer* and a description:
 *
 * | Sequence | Type | Signer | Description |
 * | --- | --- | --- | --- |
 * | 01 | TransferTransaction | Trader Account | Transfers the **input** currency to the **target** account. |
 * | 02 | TransferTransaction | Target Account | Transfers the **output** currency to the **trader** account. Note that the amount that is sent to the trader is automatically calculated. |
 * | 03 | TransferTransaction | Target Account | Adds an execution proof message sent to the **target** account. |
 *
 */
export class Swap extends Executable {
  /**
   * @access public
   * @description The list of **required** arguments to execute
   *              *this* automated pool command.
   */
  public arguments: string[] = [
    'trader',
    'input_x',
    'output',
  ]

  /**
   * Verifies **allowance** of \a actor to execute a command
   * with arguments \a argv. This method returns true if all
   * required arguments are present.
   *
   * This method asserts the presence of mandatory arguments.
   *
   * Additionally, this method asserts that amounts of assets
   * do not overflow in relation with available pool reserves.
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

    // - Reads external arguments to check for amounts
    const input_x = this.context.getInput('input_x', new AssetAmount(Symbol_Testnet_SWP, 10))

    // - Reads reserves information
    const reserve_x: number = this.reserveOf(input_x.identifier)

    // - Allows anyone to add liquidity to automated pools
    //   given a connected command execution (read-only).
    return new AllowanceResult(!!this.reserveInfo && !!this.mosaicInfo
      && input_x.amount > 0
      && reserve_x > input_x.amount
    )
  }

  // region abstract methods
  /**
   * This method returns the automated pool command name,
   * e.g. "CreatePool" or "AddLiquidity", etc.
   *
   * @access public
   * @return {string}
   **/
  public get name(): string {
    return 'Swap'
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
    return 'Swapable(v' + this.context.revision + ')' + ':swap:' + this.identifier.id
  }

  /**
   * This method returns a list of unsigned transactions in a
   * sequencial order of execution. The resulting transaction
   * array is later wrapped inside a digital contract that is
   * executed atomically such that either all transactions do
   * succeed or all transactions are cancelled.
   *
   * @see {execute()}
   * @access public
   * @return  {Transaction[]}   Given the execution of a command, returns a list of unsigned transactions.
   **/
  protected get transactions(): Transaction[] {

    // - Reads the execution context
    const reader = this.context.reader as Symbol.Reader

    // - Reads external arguments
    const trader = this.context.getInput('trader', new PublicAccount())
    const input_x = this.context.getInput('input_x', new AssetAmount(Symbol_Testnet_SWP, 10))
    const output = this.context.getInput('output', new AssetIdentifier('00000001', new PublicAccount()))

    // - Reads reserves information
    const reserve_x: number = this.reserveOf(input_x.identifier)
    const reserve_y: number = this.reserveOf(output)

    // - Calculate constant product of reserves ("current K")
    const kLast: number = reserve_x * reserve_y // + "unconfirmed in pool" + "partials in pool"

    // - Calculate "output"
    // XXX input * 0.003 ?
    const output_y: number = reserve_y - (kLast / (reserve_x + input_x.amount))

    // - Prepares the response
    const transactions: InnerTransaction[] = []
    const signers: PublicAccount[] = []

    // - Transaction 01: Transfers the **input** currency to the **target** account.
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      [
        new Mosaic(
          input_x.identifier.toMosaicId(),
          UInt64.fromUint(input_x.amount)
        )
      ],
      EmptyMessage,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 01 is issued by **trader** account
    signers.push(trader)

    // - Transaction 02: Transfers the **output** currency to the **trader** account.
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      trader.address,
      [
        new Mosaic(
          output.toMosaicId(),
          UInt64.fromUint(output_y)
        )
      ],
      EmptyMessage,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 02 is issued by **target** account
    signers.push(this.target)

    // - Transaction 03: Add execution proof transaction
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      [], // no mosaics
      PlainMessage.create(this.descriptor 
        + ':' + this.mosaicInfo?.id!.toHex() 
        + ':' + input_x.amount
        + ':' + output_y),
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 03 is issued by **provider** account ("the actor")
    signers.push(this.target)

    // - Assigns correct signer to each transaction
    return transactions.map(
      (transaction, i) => transaction.toAggregate(signers[i])
    )
  }
  // end-region abstract methods
}

