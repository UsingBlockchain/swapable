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
  Metadata,
  MetadataType,
  MosaicId,
  MosaicNonce,
  PublicAccount,
  TransferTransaction,
} from 'symbol-sdk'

// internal dependencies
import { Service } from '../contracts/Service'
import { TransactionService } from './TransactionService'
import {
  Reader as ReaderImpl,
} from '../adapters/Symbol'

// internal types
type FormattedMetadata = {
  scopedMetadataKey: string,
  senderAddress: Address,
  targetAddress: Address,
  metadataType: MetadataType,
  targetId: string | undefined,
  metadataValue: string
}

type KeyValueDictionary = {
  [k: string]: string
}

/**
 * @type PoolImpl
 * @package Swapable
 * @subpackage Services
 * @since v1.2.1
 * @description Class that describes a specific pool implementation.
 */
export type PoolImpl = {
  /**
   * The target public account that owns the liquidity pool's tradeable
   * token pairs and the liquidity provider share mosaics.
   *
   * @var {Address}
   */
  target: Address,

  /**
   * The provider mosaic refers to the liquidity provider share mosaics
   * which are attributed on a pro-rata basis.  This mosaic is modified
   * on  the network using metadata that holds information about paired
   * tokens (x & y).
   *
   * @var {MosaicId}
   */
  pMosaic: MosaicId,

  /**
   * The `x` mosaic refers to the liquidity pool's left-side token in a
   * liquidity pool with a pair of tokens.
   *
   * @var {MosaicId}
   */
  xMosaic: MosaicId,

  /**
   * The `y` mosaic refers to the liquidity pool' right-side token in a
   * liquidity pool with a pair of tokens.
   *
   * @var {MosaicId}
   */
  yMosaic: MosaicId,
}

/**
 * @class PoolService
 * @package Swapable
 * @subpackage Services
 * @since v1.2.1
 * @description Class that describes a service around liquidity pools.
 */
export class PoolService extends Service {

  /**
   * Known metadata keys.  This dictionary stores hexadecimal
   * representations for scopedMetadataKey values thus making
   * the read operations of mosaic metadata by key instead of
   * having to use hexadecimal notation to refer to these.
   *
   * @var {KeyValueDictionary}
   */
  private KNOWN_METADATAS: KeyValueDictionary = {
    '8399C1CBB066F944': 'identifier', // KeyGenerator("Pool_Id")
    '9B2823771F48325D': 'x_mosaic_id', // KeyGenerator("X_Id")
    '826A59AE988FFE4B': 'y_mosaic_id', // KeyGenerator("Y_Id")
  }

  /**
   * Getter method for networkReader.
   *
   * @access protected
   * @var {ReaderImpl}
   */
  protected get networkReader(): ReaderImpl {
    return this.context.reader as ReaderImpl
  }

  /**
   * Helper function to read all liquidity pools that are
   * publicly listed in one given \a registry public account.
   *
   * @async
   * @access public
   * @param   {PublicAccount|Address}   registry        The registry public account [address].
   * @param   {number}                  poolRevision    The liquidity pool revision.
   * @return  {MultisigAccountInfo[]}
   */
  public async getPools(
    authority: PublicAccount | Address,
    revision: number = 0
  ): Promise<PoolImpl[]> {
    const registryAddress = authority instanceof PublicAccount
      ? authority.address
      : authority as Address

    // use transaction service to read state
    const service = new TransactionService(
      this.networkReader.factoryHttp.createAccountRepository(),
      this.networkReader.factoryHttp.createChainRepository(),
      this.networkReader.factoryHttp.createTransactionRepository(),
      this.networkReader.factoryHttp.createReceiptRepository(),
      100, // pageSize
    )

    // read transfers to find CreatePool descriptor
    const transactions: TransferTransaction[] = await service.getIncomingTransfers(
      registryAddress,
      0, // no more than 1 block confirmation required
    ).toPromise()

    // filter by contract signature
    const contractSignature: string = `Swapable(v${revision}):publish:`
    const markedTransfers: TransferTransaction[] = transactions.filter(
      tx => tx.message.payload.startsWith(contractSignature)
    )

    // read recipients and contract signature
    const mosaics: { owner: Address, mosaicId: MosaicId }[] = markedTransfers.map(
      t => {
        // signature:identifier
        const identifier  = t.message.payload.substr(contractSignature.length)
        const mosaicNonce = MosaicNonce.createFromHex(identifier)
        return {
          owner: t.signer!.address,
          mosaicId: MosaicId.createFromNonce(mosaicNonce, t.signer!.address)
        }
      })

    // read metadata values to find X, Y and LP
    const readMetadataObservables: Promise<PoolImpl>[] = [];
    mosaics.map(m => readMetadataObservables.push(this.getInfo(
      m.owner,
      m.mosaicId,
    )))

    // resolve all on return
    return await Promise.all(readMetadataObservables)
  }

  /**
   * Helper function to read a liquidity pool's information
   * from the network.
   *
   * @async
   * @access public
   * @param   {MosaicId}   lpSharesMosaic        The mosaic id of liquidity provider shares.
   * @return  {PoolImpl}
   */
  public async getInfo(
    targetAddress: Address,
    lpSharesMosaic: MosaicId,
  ): Promise<PoolImpl> {

    // read all metadata values from network
    const entries = await this.networkReader.factoryHttp
      .createMetadataRepository()
      .search({ targetId: lpSharesMosaic })
      .toPromise()

    // format metadata accordingly
    const mosaicMetadata = entries.data.map(
      (metadata: Metadata) => this.formatMetadata(metadata)
    )

    // overwrite `scopedMetadataKey` values for known metadata
    const fields = Object.keys(this.KNOWN_METADATAS)
    mosaicMetadata.sort((a: FormattedMetadata, b: FormattedMetadata) => {
      const indexA = fields.findIndex(v => v === a.scopedMetadataKey)
      const indexB = fields.findIndex(v => v === b.scopedMetadataKey)
      return indexA - indexB
    })

    // read details about this liquidity pool
    const poolData = this.interpretMetadata(mosaicMetadata);
    return {
      target: targetAddress,
      pMosaic: lpSharesMosaic,
      xMosaic: new MosaicId(poolData['x_mosaic_id']),
      yMosaic: new MosaicId(poolData['y_mosaic_id']),
    } as PoolImpl
  }

  /**
   * Helper function to retrieve known mosaic metadata keys
   *
   * @access protected
   * @param   {string}  hexKey
   * @returns {string}
   */
  protected getKnownMetadataKey(
    hexKey: string,
  ): string {
    return hexKey in this.KNOWN_METADATAS
      ? this.KNOWN_METADATAS[hexKey]
      : hexKey
  }

  /**
   * Helper function to format a metadata entry correctly
   * and consistently around a mosaic and target account.
   *
   * @access protected
   * @param   {Metadata}  metadata 
   * @returns {FormattedMetadata}
   */
  protected formatMetadata(
    metadata: Metadata,
  ): FormattedMetadata {
    const metadataEntry = metadata.metadataEntry
    return ({
      ...metadataEntry,
      scopedMetadataKey: metadataEntry.scopedMetadataKey.toHex(),
      senderAddress: metadataEntry.sourceAddress,
      targetAddress: metadataEntry.targetAddress,
      metadataType: MetadataType.Mosaic,
      targetId: metadataEntry.targetId ? metadataEntry.targetId.toHex() : undefined,
      metadataValue: metadataEntry.value
    })
  }

  /**
   * Helper function to read known metadata keys and assign
   * them  as keys of one new object containing  only known
   * metadata field values.
   *
   * @access protected
   * @param   {FormattedMetadata[]}   metadata 
   * @returns {KeyValueDictionary}
   */
  protected interpretMetadata(
    formattedMetadata: FormattedMetadata[],
  ): KeyValueDictionary  {
    const fields = Object.keys(this.KNOWN_METADATAS)
    let known: KeyValueDictionary = {}
    for (let i = 0, m = fields.length; i < m; i++) {
      const entry = formattedMetadata[i]
      const field = this.getKnownMetadataKey(entry.scopedMetadataKey)

      if (fields.includes(entry.scopedMetadataKey)) {
        known[field] = entry.metadataValue
      }
      else {
        known[field] = ''
      }
    }

    return known
  }
}
