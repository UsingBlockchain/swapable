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
  MosaicId,
} from 'symbol-sdk'

// internal dependencies
import { getTestAccount } from './Accounts'
import { Context, TransactionParameters, Symbol } from '../../index'

export const getTestContext = (
  nodeUrl: string,
  actor?: string
): Context => {
  return new Context(
    1,
    getTestAccount(actor || 'operator1'),
    new Symbol.Reader(
      nodeUrl,
      getTestAccount('operator1').address.networkType,
      'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4',
      1573430400,
      new MosaicId('519FC24B9223E0B4'),
      'DummyNodePublicKey',
    ),
    new TransactionParameters(
      1573430400,
      Deadline.create(1573430400),
      undefined, // maxFee
    ),
    undefined,
  )
}
