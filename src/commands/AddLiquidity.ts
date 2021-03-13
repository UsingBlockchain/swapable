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
  MosaicSupplyChangeTransaction,
  MosaicSupplyChangeAction,
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
 * @class Swapable.AddLiquidity
 * @package Swapable
 * @subpackage Commands
 * @since v1.0.0
 * @description Class that describes a command for adding assets
 *              in automated liquidity pools (i.e. "deposit").
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
 * | 01 | MosaicSupplyChangeTransaction | Target Account | Creates an amount of automated pool shares that is proportional to the amount of liquidity added in the pool. These shares represent the contribution made to the pool by the liquidity provider. |
 * | 02 | TransferTransaction | Target Account | Transfers the added automated pool shares to the liquidity provider. |
 * | 03 | TransferTransaction | Provider Account | Transfers the **added liquidity** of `x` and `y` to the target account. |
 * | 04 | TransferTransaction | Provider Account | Adds an execution proof message sent to the **target** account. |
 *
 */
export class AddLiquidity extends Executable {
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

    // - Allows anyone to add liquidity to automated pools
    //   given a connected command execution (read-only).
    return new AllowanceResult(
      !!this.reserveInfo && !!this.mosaicInfo
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
    return 'AddLiquidity'
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
    return 'Swapable(v' + this.context.revision + ')' + ':add-liquidity:' + this.identifier.id
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

    // - Reads external arguments
    const provider = this.context.getInput('provider', new PublicAccount())
    const input_x = this.context.getInput('input_x', new AssetAmount(Symbol_Testnet_SWP, 10))
    const input_y = this.context.getInput('input_y', new AssetAmount(Symbol_Testnet_XYM, 10))

    // - Reads shares and reserves information
    const supply_lp: number = this.mosaicInfo?.supply?.compact() ?? 0
    const reserve_x: number = this.reserveOf(input_x.identifier)
    const reserve_y: number = this.reserveOf(input_y.identifier)

    // MINT FEE principle (0.05 % of shares issued), 
    // https://github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2Pair.sol#L117
    // if fee is on, mint liquidity equivalent to 1/6th of the growth in sqrt(k)
    //XXX if (pool_exists)
    //XXX   rootK = Math.sqrt(reserve0 * reserve1)
    //XXX   rootKLast = Math.sqrt(kLast)
    //XXX   if (rootK > rootKLast)
    //XXX     numerator = totalSupply.mul(rootK.sub(rootKLast));
    //XXX     denominator = rootK.mul(5).add(rootKLast);
    //XXX     liquidity = numerator / denominator;
    //XXX     if (liquidity > 0) _mint(feeTo, liquidity);
    //XXX else kLast = 0

    // - Calculate liquidity proportions ("contribution of provider")
    const liquidity = Math.min(
      (input_x.amount * supply_lp) / reserve_x,
      (input_y.amount * supply_lp) / reserve_y
    )

    // - Prepares the response
    const transactions: InnerTransaction[] = []
    const signers: PublicAccount[] = []

    // - Transaction 01: MosaicSupplyChangeTransaction
    // :note: The canExecute() method verifies that `mosaicInfo` is set.
    transactions.push(MosaicSupplyChangeTransaction.create(
      this.context.parameters.deadline,
      this.mosaicInfo?.id!,
      MosaicSupplyChangeAction.Increase,
      UInt64.fromUint(liquidity),
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 01 is issued by **target** account
    signers.push(this.target)

    // - Transaction 02: Transfers added automated pool shares to liquidity provider
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      provider.address,
      [
        new Mosaic(
          this.identifier.toMosaicId(),
          UInt64.fromUint(liquidity)
        )
      ],
      EmptyMessage,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 02 is issued by **target** account
    signers.push(this.target)

    // - Transaction 03: Transfers initially added liquidity to target account
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
        )
      ],
      EmptyMessage,
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 03 is issued by **provider** account
    signers.push(provider)

    // - Transaction 04: Add execution proof transaction
    transactions.push(TransferTransaction.create(
      this.context.parameters.deadline,
      this.target.address,
      [], // no mosaics
      PlainMessage.create(this.descriptor 
        + ':' + this.mosaicInfo?.id!.toHex() 
        + ':' + input_x.identifier.toMosaicId().toHex()
        + ':' + input_y.identifier.toMosaicId().toHex()),
      reader.networkType,
      undefined, // maxFee 0 for inner
    ))

    // - Transaction 04 is issued by **provider** account ("the actor")
    signers.push(provider)

    // - Assigns correct signer to each transaction
    return transactions.map(
      (transaction, i) => transaction.toAggregate(signers[i])
    )
  }
  // end-region abstract methods
}
