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
  MosaicId,
  MosaicNonce,
  PublicAccount,
  Transaction,
  TransferTransaction,
  PlainMessage,
  UInt64,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicSupplyChangeTransaction,
  MosaicSupplyChangeAction,
  MosaicMetadataTransaction,
  KeyGenerator,
  AccountMosaicRestrictionTransaction,
  MosaicRestrictionFlag,
  AccountMetadataTransaction,
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

// XXX remove this, used only for type-discovery in command options below.
const Symbol_Testnet_SWP = new AssetIdentifier('00000001', new PublicAccount())
const Symbol_Testnet_XYM = new AssetIdentifier('00000002', new PublicAccount())

/**
 * @class Swapable.CreatePool
 * @package Swapable
 * @subpackage Commands
 * @since v1.0.0
 * @description Class that describes a command for creating
 *              automated liquidity pools.
 * @summary
 * This automated pool command accepts the following arguments:
 *
 * | Argument | Description | Example |
 * | --- | --- | --- |
 * | provider | Liquidity provider | `new PublicAccount(...)` |
 * | input_x | Amount and asset identifier of `x` (first in pair) | `new AssetAmount(...)` |
 * | input_y | Amount and asset identifier of `y` (second in pair) | `new AssetAmount(...)` |
 *
 * The execution of this command results in the creation of
 * the following list of transactions with their respective
 * *signer* and a description:
 *
 * | Sequence | Type | Signer | Description |
 * | --- | --- | --- | --- |
 * | 01 | AccountMetadataTransaction | Target Account | Assigns the `Pool_Id` metadata value to the **target** account. |
 * | 02 | MosaicDefinitionTransaction | Target Account | Creates the automated pool shares mosaic. Automated pool shares are distributed **at pro-rata** rates amongst liquidity providers. There is **one** automated pool shares **mosaic** per each automated liquidity pool. |
 * | 03 | MosaicSupplyChangeTransaction | Target Account | Creates the initial supply of automated pool shares for a liquidity pool pairing cryptocurrencies `x` (left-side input) and `y` (right-side input). The added amount is equal to `sqrt(x * y)`. |
 * | 04 | MosaicMetadataTransaction | Target Account | Assigns the `Pool_Id` metadata value to the automated pool shares **mosaic**. |
 * | 05 | MosaicMetadataTransaction | Target Account | Assigns the `X_Id` metadata value to the automated pool shares **mosaic**. |
 * | 06 | MosaicMetadataTransaction | Target Account | Assigns the `Y_Id` metadata value to the automated pool shares **mosaic**. |
 * | 07 | AccountMosaicRestrictionTransaction | Target Account | Restricts the **target** account such that it can **only hold** the concerned mosaics (i.e.: the automated pool shares mosaic, the network fee mosaic, the `x` mosaic and the `y` mosaic). :warning: This transaction protects the **target** account from SPAM transactions/mosaics. |
 * | 08 | TransferTransaction | Target Account | Transfers the initially created supply of automated pool shares to the liquidity provider. |
 * | 09 | TransferTransaction | Provider Account | Transfers the initially **added liquidity** of `x` and `y` to the target account. |
 * | 10 | TransferTransaction | Provider Account | Adds an execution proof message sent to the **target** account. |
 *
 */
export class CreatePool extends Executable {
  /**
   * @access public
   * @description The list of **required** arguments to execute
   *              *this* automated pool command.
   */
  public arguments: string[] = [
    'provider',
    'input_x',
    'input_y',
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

    // - Allows anyone to create automated liquidity pools
    return new AllowanceResult(true)
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
    return 'CreatePool'
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
    return 'Swapable(v' + this.context.revision + ')' + ':create-pool:' + this.identifier.id
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
    const target = this.target
    const reader = this.context.reader as Symbol.Reader
    const identifier = this.identifier.id

    // - Read external arguments
    const provider = this.context.getInput('provider', new PublicAccount())
    const input_x = this.context.getInput('input_x', new AssetAmount(Symbol_Testnet_SWP, 10))
    const input_y = this.context.getInput('input_y', new AssetAmount(Symbol_Testnet_XYM, 10))

    // - The amount of shares sent is equal to sqrt(x * y) with 6 decimals
    const shares = 1_000_000 * Math.sqrt(input_x.amount * input_y.amount)

    // - Prepares the response
    const transactions: InnerTransaction[] = []
    const signers: PublicAccount[] = []

    // - Transaction 01: AccountMetadataTransaction
    transactions.push(AccountMetadataTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      KeyGenerator.generateUInt64Key('Pool_Id'),
      this.identifier.id.length,
      this.identifier.id,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 01 is issued by **target** account
    signers.push(this.target)

    // - Transaction 02: MosaicDefinitionTransaction
    const mosaicNonce = MosaicNonce.createFromHex(identifier)
    const mosaicId = MosaicId.createFromNonce(mosaicNonce, target.address)
    transactions.push(MosaicDefinitionTransaction.create(
      this.context.parameters.deadline,
      mosaicNonce,
      mosaicId,
      MosaicFlags.create(true, true, true), // mutable supply.
      6,
      UInt64.fromUint(0), // do-not-expire
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 02 is issued by **target** account
    signers.push(this.target)

    // - Transaction 03: MosaicSupplyChangeTransaction
    transactions.push(MosaicSupplyChangeTransaction.create(
      this.context.parameters.deadline,
      mosaicId,
      MosaicSupplyChangeAction.Increase,
      UInt64.fromUint(shares),
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 03 is issued by **target** account
    signers.push(this.target)

    // - Transaction 04: MosaicMetadataTransaction attaching `Pool_Id`
    transactions.push(MosaicMetadataTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      KeyGenerator.generateUInt64Key('Pool_Id'),
      mosaicId,
      this.identifier.id.length,
      this.identifier.id,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 04 is issued by **target** account
    signers.push(this.target)

    // - Transaction 05: MosaicMetadataTransaction attaching `X_Id`
    transactions.push(MosaicMetadataTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      KeyGenerator.generateUInt64Key('X_Id'),
      mosaicId,
      input_x.identifier.id.length,
      input_x.identifier.id,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 05 is issued by **target** account
    signers.push(this.target)

    // - Transaction 06: MosaicMetadataTransaction attaching `Y_Id`
    transactions.push(MosaicMetadataTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      KeyGenerator.generateUInt64Key('Y_Id'),
      mosaicId,
      input_y.identifier.id.length,
      input_y.identifier.id,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 06 is issued by **target** account
    signers.push(this.target)

    // - Transaction 07: AccountMosaicRestrictionTransaction with MosaicId = [mosaicId, feeMosaicId, x, y]
    // :warning: This transaction **restricts** the account to accept only the listed mosaics. Transfers
    // to this account, that hold any other mosaic(s) will not be accepted by the network anymore.
    transactions.push(AccountMosaicRestrictionTransaction.create(
      this.context.parameters.deadline,
      MosaicRestrictionFlag.AllowMosaic,
      [
        mosaicId,
        reader.feeMosaicId,
        input_x.identifier.toMosaicId(),
        input_y.identifier.toMosaicId(),
      ],
      [],
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 07 is issued by **target** account
    signers.push(this.target)

    // - Transaction 08: Transfers initially issued automated pool shares to liquidity provider
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      provider.address,
      [
        new Mosaic(
          this.identifier.toMosaicId(),
          UInt64.fromUint(shares)
        ),
      ],
      EmptyMessage,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 08 is issued by **target** account
    signers.push(this.target)

    // - Transaction 09: Transfers initially added liquidity to target account
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      [
        new Mosaic(
          input_x.identifier.toMosaicId(),
          UInt64.fromUint(input_x.amount)
        ),
        new Mosaic(
          input_y.identifier.toMosaicId(),
          UInt64.fromUint(input_y.amount)
        ),
      ],
      EmptyMessage,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 09 is issued by **provider** account
    signers.push(provider)

    // - Transaction 10: Add execution proof transaction
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      [], // no mosaics
      PlainMessage.create(this.descriptor 
        + ':' + mosaicId.toHex() 
        + ':' + input_x.identifier.toMosaicId().toHex()
        + ':' + input_y.identifier.toMosaicId().toHex()),
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 10 is issued by **provider** account ("the actor")
    signers.push(provider)

    // - Assigns correct signer to each transaction
    return transactions.map(
      (transaction, i) => transaction.toAggregate(signers[i])
    )
  }
  // end-region abstract methods
}
