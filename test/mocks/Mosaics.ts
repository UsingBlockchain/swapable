/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import {
  MosaicId,
  MosaicInfo,
  MosaicFlags,
  UInt64,
} from 'symbol-sdk'

// internal dependencies
import { getTestAccount } from './Accounts'

export const getTestMosaicInfo = (
  mosaicId: string
): MosaicInfo => {
  return new MosaicInfo(
    1,
    '1',
    new MosaicId(mosaicId),
    UInt64.fromUint(1),
    UInt64.fromUint(1),
    getTestAccount('target').address,
    1,
    new MosaicFlags(1),
    1,
    UInt64.fromUint(1)
  )
}
