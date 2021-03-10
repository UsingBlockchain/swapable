/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import { PublicAccount } from 'symbol-sdk'

// internal dependencies
import {
  CommandOption,
  Reader,
  KeyProvider,
  TransactionParameters,
} from '../../index'

/**
 * @class Context
 * @package Swapable
 * @subpackage Contracts
 * @since v1.0.0
 * @description Class that describes a digital asset command execution context.
 */
export class Context {

  public constructor(
    /**
     * @description Standard revision
     */
    public revision: number,

    /**
     * @description Execution actor
     */
    public actor: PublicAccount,

    /**
     * @description Blockchain reader adapter.
     */
    public reader: Reader,

    /**
     * @description Blockchain key provider.
     */
    public signer: KeyProvider,

    /**
     * @description Transaction parameters
     */
    public parameters: TransactionParameters,

    /**
     * @description Execution parameters
     */
    protected argv: CommandOption[] | undefined,
  ) {}

  /**
   * Read an input by its' `name` in `argv` options.
   *
   * @param   {string} name
   * @param   {Array<CommandOption>}   argv
   * @param   {any} defaultValue
   * @return  {CommandOption|undefined}
   */
  public getInput<ValueType>(
    name: string,
    defaultValue: ValueType,
  ): ValueType {
    if (undefined === this.argv || !this.argv.length) {
      return defaultValue
    }

    // find by name and return value
    const it = this.argv.find(opt => opt.name === name)
    return it ? it.value as ValueType : defaultValue
  }

  /**
   * Set the value of an input by its' `name` in `argv` options.
   *
   * @param   {string}      name
   * @param   {ValueType}   value
   * @return  {Context}
   */
  public setInput<ValueType>(
    name: string,
    value: ValueType,
  ): Context {
    if (undefined === this.argv) {
      this.argv = []
    }

    this.argv.push(new CommandOption(
      name,
      value,
    ))

    return this
  }
}
