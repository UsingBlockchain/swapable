/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import { PublicAccount, Transaction } from 'symbol-sdk'
import { TransactionURI } from 'symbol-uri-scheme'

// internal dependencies
import {
  AllowanceResult,
  CommandOption,
  Context,
} from '../../index'

/**
 * @interface Command
 * @package Swapable
 * @subpackage Contracts
 * @since v1.0.0
 * @description Interface that describes commands on digital assets.
 */
export interface Command {
  /**
   * @description The command name
   */
  readonly name: string

  /**
   * @description The command execution context
   */
  readonly context: Context

  /**
   * @description The command on-chain descriptor
   */
  readonly descriptor: string

  /**
   * Verifies **allowance** of `actor` to execute command. Arguments to
   * the command execution can be passed in `argv`.
   *
   * @param   {PublicAccount}           actor
   * @param   {Array<CommandOption>}    argv
   * @return  {AllowanceResult}
   **/
  canExecute(
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
  execute(
    actor: PublicAccount,
    argv: CommandOption[] | undefined,
  ): TransactionURI<Transaction>
}
