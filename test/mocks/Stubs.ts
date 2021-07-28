/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import {
  Address,
  AccountHttp as BaseAccountRepository,
  ChainHttp as BaseChainRepository,
  Deadline,
  EmptyMessage,
  KeyGenerator,
  Metadata as BaseMetadata,
  MetadataEntry as BaseMetadataEntry,
  MetadataHttp as BaseMetadataRepository,
  MetadataType,
  MosaicFlags,
  MosaicHttp as BaseMosaicRepository,
  MosaicId,
  MosaicInfo as BaseMosaicInfo,
  NetworkType,
  Page as BasePage,
  ReceiptHttp as BaseReceiptRepository,
  TransactionHttp as BaseTransactionRepository,
  TransferTransaction as BaseTransferTransaction,
  UInt64,
  Mosaic,
} from 'symbol-sdk'

import { getTestAccount } from './Accounts'
import { TransactionService as BaseTransactionService } from '../../src/services/TransactionService'

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
   * @class Stubs.MetadataRepository
   * @description Stub for MetadataHttp class of symbol-sdk
   */
  export class MetadataRepository extends BaseMetadataRepository {}

  /**
   * @class Stubs.ChainRepository
   * @description Stub for ChainHttp class of symbol-sdk
   */
  export class ChainRepository extends BaseChainRepository {}

  /**
   * @class Stubs.TransactionRepository
   * @description Stub for TransactionHttp class of symbol-sdk
   */
  export class TransactionRepository extends BaseTransactionRepository {}

  /**
   * @class Stubs.ReceiptRepository
   * @description Stub for ReceiptHttp class of symbol-sdk
   */
  export class ReceiptRepository extends BaseReceiptRepository {}

  /**
   * @class Stubs.Page
   * @description Stub for Page class of symbol-sdk
   */
  export class Page<T> extends BasePage<T> {
    public constructor(data: T[]) {
      super(data, 1, 1)
    }
  }

  /**
   * @class Stubs.MosaicInfo
   * @description Stub for MosaicInfo class of symbol-sdk
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

  /**
   * @class Stubs.Metadata
   * @description Stub for Metadata class of symbol-sdk
   */
  export class Metadata extends BaseMetadata {
    public constructor(
      mosaicId: MosaicId,
      metadataKey: string,
      metadataValue: string,
    ) {
      // @link http://dual-01.dhealth.cloud:3000/metadata?targetId=170834A66B95C059
      super(
        '60906F09366FC30084C1A460',
        new BaseMetadataEntry(
          1,
          '0FCB18A61FFE51AECCBF00B2025E940813F962BCF16F7E1CA1BC65E535445397',
          Address.createFromEncoded('68296FE618B3219561C66DBF76F62C45DA5D45B4E8B62EC7'),
          Address.createFromEncoded('68296FE618B3219561C66DBF76F62C45DA5D45B4E8B62EC7'),
          KeyGenerator.generateUInt64Key(metadataKey),
          MetadataType.Mosaic,
          metadataValue,
          mosaicId,
        )
      )
    }
  }

  /**
   * @class Stubs.TransferTransaction
   * @description Stub for TransferTransaction class of symbol-sdk
   */
  export class TransferTransaction extends BaseTransferTransaction {
    public constructor(mosaicId: MosaicId) {
      super(
        NetworkType.TEST_NET,
        1,
        Deadline.create(1),
        UInt64.fromUint(0),
        getTestAccount('target').address,
        [new Mosaic(mosaicId, UInt64.fromUint(1))],
        EmptyMessage,
      )
    }
  }

  /**
   * @class Stubs.TransactionService
   * @description Stub for internal TransactionService class
   */
  export class TransactionService extends BaseTransactionService {
    public constructor() {
      super(
        new AccountRepository('http://localhost:3000'),
        new ChainRepository('http://localhost:3000'),
        new TransactionRepository('http://localhost:3000'),
        new ReceiptRepository('http://localhost:3000'),
        100 // pageSize
      )
    }
  }
}
