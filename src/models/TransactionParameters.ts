/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import {
  Deadline,
  UInt64,
} from 'symbol-sdk'

/**
 * @class TransactionParameters
 * @package Swapable
 * @subpackage Models
 * @since v1.0.0
 * @description Model that describes parameters for transactions with digital assets.
 */
export class TransactionParameters {
  /**
   * @description The transaction maxFee
   */
  public maxFee: UInt64 | undefined = undefined

  /**
   * Construct an execution parameters instance
   *
   * @param {Deadline}            Deadline
   * @param {UInt64|undefined}    maxFee
   */
  public constructor(
    /**
     * @description The network epoch adjustment (in seconds)
     */
    public epochAjustment: number = 1573430400,

    /**
     * @description The transaction deadline
     */
    public deadline: Deadline = Deadline.create(epochAjustment),

    /**
     * @description The transaction maxFee
     */
    public maxFeeInt?: number,

  ) {
    if (this.maxFeeInt !== undefined) {
      this.maxFee = UInt64.fromUint(this.maxFeeInt)
    }
  }
}
