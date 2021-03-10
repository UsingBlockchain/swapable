/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

/**
 * @class CommandOption
 * @package Swapable
 * @subpackage Models
 * @since v1.0.0
 * @description Generic model that describes parameters of a command execution.
 */
export class CommandOption<ValueType = any> {

  /**
   * Constructor for CommandOption objects
   *
   * @param {string} name
   * @param {ValueType} value
   */
  public constructor(
    /**
     * @description The option name
     */
    public name: string,

    /**
     * @description The option value
     */
    public value: ValueType,
  )
  {}
}
