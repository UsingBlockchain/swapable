/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import {
  RepositoryFactoryHttp,
  RepositoryFactoryConfig,
  NetworkType,
  MosaicId,
} from 'symbol-sdk'

// internal dependencies
import { Reader as BaseReader } from '../contracts/Reader'

/**
 * @class Reader implements BaseReader
 * @package Swapable
 * @subpackage Adapters
 * @since v1.0.0
 * @description Class that describes the blockchain network adapter
 *              for Symbol from NEM compatible network nodes.
 * @link https://symbolplatform.com
 */
export class Reader implements BaseReader {

  /**
   * @description Repository factory (symbol-sdk)
   */
  public factoryHttp: RepositoryFactoryHttp

  /**
   * Construct a network configuration object
   *
   * @param {string}      gatewayUrl
   * @param {NetworkType} networkType
   * @param {string}      generationHash
   * @param {number}      epochAdjustment
   * @param {MosaicId}    feeMosaicId
   */
  public constructor(
    /**
     * @description The REST endpoint URL
     */
    public gatewayUrl: string,

    /**
     * @description The network type
     */
    public networkType: NetworkType,

    /**
     * @description The network generation hash
     */
    public generationHash: string,

    /**
     * @description The network epoch adjustment
     */
    public epochAdjustment: number,

    /**
     * @description The network fee mosaic id
     */
    public feeMosaicId: MosaicId,

    /**
     * @description (Optional) The node public key
     */
    public nodePublicKey?: string
  ) {
    this.factoryHttp = new RepositoryFactoryHttp(gatewayUrl, {
      networkType,
      generationHash,
      epochAdjustment,
      nodePublicKey,
    } as RepositoryFactoryConfig)
  }
}
