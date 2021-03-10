/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

/**
 * @class AllowanceResult
 * @package Swapable
 * @subpackage Models
 * @since v1.0.0
 * @description Model that describes the result of an allowance request.
 */
export class AllowanceResult {
  /**
   * Constructor for AllowanceResult objects
   *
   * @param {boolean} status
   * @param {string|undefined} message (Optional)
   */
  public constructor(
    /**
     * @description The result status
     */
    public status: boolean,

    /**
     * @description The result message (Optional)
     */
    public message: string | undefined = undefined,
  )
  {}
}
