/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import { AssetIdentifier } from './AssetIdentifier'

/**
 * @class AssetAmount
 * @package Swapable
 * @subpackage Models
 * @since v1.0.0
 * @description Model that describes an amount of a digital asset.
 */
export class AssetAmount {
  /**
   * Constructor for AssetAmount objects
   *
   * @param {AssetIdentifier} identifier
   * @param {number}          amount
   */
  public constructor(
    /**
     * @description The digital asset identifier
     */
    public identifier: AssetIdentifier,

    /**
     * @description The amount
     */
    public amount: number,
  )
  {}
}
