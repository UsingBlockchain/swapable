/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
export interface Reader {

  /**
   * @description The endpoint URL. This URL shall point to the network
   *              node that is used to READ data about swapable assets.
   *
   * @example https://node.ubc.digital:3000
   * @example xml+rpc://bitcoin.ubc.digital:1234
   */
  gatewayUrl: string

}
