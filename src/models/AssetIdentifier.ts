/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import {
  Convert,
  MosaicId,
  MosaicNonce,
  PublicAccount,
  SHA3Hasher,
} from 'symbol-sdk'
import { AssetSource } from './AssetSource'

/**
 * @class AssetIdentifier
 * @package Swapable
 * @subpackage Models
 * @since v1.0.0
 * @description Model that describes identifiers of digital assets. An identifier
 *              is created around an \a id (4 bytes), a \a source and an \a owner
 *              public account (32 bytes).  The owner account is always the first
 *              liquidity provider of a pool `x:y`.
 */
export class AssetIdentifier {
  /**
   * Constructor for AssetIdentifier objects
   *
   * @param {string} id
   * @param {AssetSource} source
   * @param {PublicAccount} target
   */
  public constructor(
    /**
     * @description A unique identifier for an asset.
     *
     * e.g.: "0a1f3e2c" (4 bytes)
     */
    public id: string,

    /**
     * @description The deterministic account that represents the digital asset.
     *              This account is also the owner of the mosaic on the network.
     */
    public target: PublicAccount,
  )
  {}

  /**
   * Getter for the readonly property `nonce`.
   *
   * @return {MosaicNonce}
   */
  public get nonce(): MosaicNonce {
    return MosaicNonce.createFromHex(this.id)
  }

  /**
   * Get mosaic id representation of an asset identifier.
   *
   * @return {MosaicId}
   */
  public toMosaicId(): MosaicId {
    return MosaicId.createFromNonce(this.nonce, this.target.address)
  }

  /**
   * Creates an asset identifier from a \a name, a \a target
   * public account and a \a source asset source blockchain
   * network.
   *
   * This method returns a deterministic identifier build
   * from its three arguments.
   *
   * @static
   * @access public
   * @param   {string}            name      The cryptocurrency name (e.g.: "symbol.xym", "Bitcoin", etc.).
   * @param   {PublicAccount}     target    The target public account (public key of the ISSUER of the cryptocurrency).
   * @param   {AssetSource}       source    The source network information for the asset (i.e. where it is issued).
   * @return  {AssetIdentifier}   Given a triplet of name, target account address and source network, returns a deterministic asset identifier.
   */
  public static createForSource(
    name: string,
    target: PublicAccount,
    source: AssetSource,
  ): AssetIdentifier {
    // prepare deterministic pool identifier (sha3-512)
    const hash = new Uint8Array(64)
    const data = target.address.plain()
      + '-' + source.source
      + '-' + name
    SHA3Hasher.func(hash, Convert.utf8ToUint8(data), 64)

    // 4 left-most bytes for the identifier
    const left4b: string = hash.slice(0, 4).reduce(
      (s, b) => s + b.toString(16).padStart(2, '0'),
      '', // initialValue
    )

    return new AssetIdentifier(left4b, target)
  }
}
