/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
// internal dependencies
import { Context } from '../../index'

/**
 * @class Service
 * @package Swapable
 * @subpackage Contracts
 * @since v1.0.0
 * @description Abstract class that describes a service interface for
 *              low-level blockchain feature integrations.
 */
export abstract class Service {
  /**
   * Construct a service object around `context`
   *
   * @param {Context} context 
   */
  public constructor(
    /**
     * @description Execution context
     */
    protected readonly context: Context,
  ) {}
}
