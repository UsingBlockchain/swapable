/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
 import { 
  MosaicHttp as BaseMosaicRepository,
  AccountHttp as BaseAccountRepository,
  MosaicInfo as BaseMosaicInfo,
  MosaicId,
  MosaicFlags,
  UInt64,
} from 'symbol-sdk'

import { getTestAccount } from './Accounts'

/**
 * @namespace Stubs
 * @package Swapable
 * @subpackage Tests
 * @since v1.0.2
 * @description Namespace that contains stubbed classes for tests
 */
export namespace Stubs {
  /**
   * @class Stubs.MosaicRepository
   * @description Stub for MosaicHttp class of symbol-sdk
   */
  export class MosaicRepository extends BaseMosaicRepository {}

  /**
   * @class Stubs.AccountRepository
   * @description Stub for AccountHttp class of symbol-sdk
   */
  export class AccountRepository extends BaseAccountRepository {}

  /**
   * @class Stubs.MosaicInfo
   * @description Stub for AccountHttp class of symbol-sdk
   */
  export class MosaicInfo extends BaseMosaicInfo {
    public constructor(mosaicId: MosaicId) {
      super(
        1,
        '1',
        mosaicId,
        UInt64.fromUint(1),
        UInt64.fromUint(1),
        getTestAccount('target').address,
        1,
        new MosaicFlags(0),
        0,
        UInt64.fromUint(0)
      )
    }
  }
}
