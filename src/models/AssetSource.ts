/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { Network } from 'symbol-hd-wallets'

/**
 * @class AssetSource
 * @package Swapable
 * @subpackage Models
 * @since v1.0.0
 * @description Model that describes the source blockchain network of a digital asset.
 */
export class AssetSource {
  /**
   * Constructor for AssetSource objects
   *
   * @param {string} source
   * @param {Network} network
   */
  public constructor(
    /**
     * @description The source network generation hash
     *
     * This value identifies a blockchain network by its genesis block hash. In case
     * of hard-forked networks, the hash of the _first block_ on the _concurring_ chain
     * must be used to identify the new network.
     *
     * @example Source for "Bitcoin Mainnet" is: `000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`
     * @example Source for "NEM Mainnet" is: `438cf6375dab5a0d32f9b7bf151d4539e00a590f7c022d5572c7d41815a24be4`
     */
    public source: string,

    /**
     * @description The source network identity
     *
     * This value identifies a blockchain network's BIP32 keychain.
     *
     * @example Network for "Bitcoin Mainnet" is: `Network.BITCOIN`
     * @example Network for "Symbol Mainnet" is: `Network.CATAPULT_PUBLIC`
     */
    public network: Network = Network.CATAPULT_PUBLIC
  )
  {}
}
