/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */
import { Wallet, Network } from 'symbol-hd-wallets'

/**
 * @interface KeyProvider
 * @package Swapable
 * @subpackage Contracts
 * @since v1.0.0
 * @description Interface that describes key providers.
 */
export interface KeyProvider {

  /**
   * @description The provider keychain (e.g.: Network.BITCOIN, Network.CATAPULT)
   */
  readonly keyChain: Network

  /**
   * Creates a key provider for the current blockchain implementation.
   *
   * @see symbol-hd-wallets
   * @param   {Buffer}    seed    The password encrypted mnemonic seed (bip39).
   * @return  {Wallet}    Returns a key provider.
   */
  getKeyProvider(
    seed: Buffer,
  ): Wallet

  /**
   * Unlock a key tree for signing. This method returns
   * a private key.
   *
   * @param {string}    derivationPath
   * @return {Buffer}
   */
  getPrivateKey(
    seed: Buffer,
    derivationPath: string,
  ): Buffer
}
