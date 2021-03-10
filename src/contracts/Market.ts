/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import { PublicAccount, Transaction } from 'symbol-sdk'
import { TransactionURI } from 'symbol-uri-scheme'

// internal dependencies
import {
  AllowanceResult,
  AssetIdentifier,
  CommandOption,
  Reader,
  TransactionParameters,
} from '../../index'

/**
 * @interface Market
 * @package Swapable
 * @subpackage Contracts
 * @since v1.0.0
 * @description Interface that describes a digital market for swapable digital assets.
 */
export interface Market {
  /**
   * @description A blockchain reader adapter.
   */
  readonly reader: Reader

  /**
   * Synchronize the command execution with the network. This method shall
   * be used to fetch data required for execution (sometimes optional).
   *
   * @async
   * @return {Promise<boolean>}
   */
  synchronize(): Promise<boolean>

  /**
   * Verifies the autorization for \a actor to execute a pool
   * command \a command given \a sharesAssetId automated pool
   * shares asset identifier.
   *
   * @access public
   * @param   {PublicAccount}         actor           The actor is whom executes the command.
   * @param   {AssetIdentifier}       sharesAssetId   The automated pool shares asset identifier.
   * @param   {string}                command         The automated pool command.
   * @param   {Array<CommandOption>}  argv            The command options (arguments).
   * @return  {AllowanceResult}       Returns whether an actor is authorized to execute said command.
   **/
  canExecute(
    actor: PublicAccount,
    sharesAssetId: AssetIdentifier,
    command: string,
    argv: CommandOption[]
  ): AllowanceResult

  /**
   * Executes \a command given \a sharesAssetId automated pool
   * shares asset identifier, \a actor public account, \a argv
   * command execution options and \a parameters to broadcast.
   *
   * @internal This method MUST use the `Command.execute()` method.
   * @internal This method MUST call the `synchronize()` method.
   * @param   {PublicAccount}             actor           The actor is whom executes the command.
   * @param   {AssetIdentifier}           sharesAssetId   The automated pool shares asset identifier.
   * @param   {string}                    command         The automated pool command descriptor (e.g. "CreatePool").
   * @param   {TransactionParameters}     parameters      The transaction parameters (network specific).
   * @param   {Array<CommandOption>}      argv            The command execution options (arguments).
   * @return  {Promise<TransactionURI>}
   **/
  execute(
    actor: PublicAccount,
    assetId: AssetIdentifier,
    command: string,
    parameters: TransactionParameters,
    argv: CommandOption[],
  ): Promise<TransactionURI<Transaction>>
}
