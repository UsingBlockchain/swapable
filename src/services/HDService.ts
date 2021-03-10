/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

// internal dependencies
import {
  Service
} from '../contracts/Service'
import { FailureInvalidDerivationPath } from '../errors/FailureInvalidDerivationPath'

/**
 * @namespace Derivation
 * @package Swapable
 * @subpackage Services
 * @since v1.0.0
 * @description Namespace that encapsulates HD keys derivation features.
 */
export namespace Derivation {
  /**
   * @enum DerivationPathLevels
   * @description Enumeration of available derivation path levels (as of BIP44).
   * @link https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels
   */
  export enum DerivationPathLevels {
    Purpose = 1,
    CoinType = 2,
    Account = 3,
    Remote = 4, // BIP44=change
    Address = 5,
  }

  /**
   * @class HDService
   * @package Swapable
   * @subpackage Services
   * @since v1.0.0
   * @description Class that describes a service around hierarchical deterministic wallets.
   */
  export class HDService extends Service {

    /**
     * @function Swapable.HDService.isValidPath()
     * @static
     * @access public
     * @description Helper function to validate a derivation path.
     */
    public static isValidPath = (
      path: string,
    ): boolean => {
      if (path.match(/^m\/44'\/[0-9]+'\/[0-9]+'\/[0-9]+'\/[0-9]+'/)) {
        return true
      }

      return false
    }

    /**
     * @function Swapable.HDService.assertValidPath()
     * @static
     * @access public
     * @description Helper function to assert whether a path is a valid derivation path.
     * @throws {FailureInvalidDerivationPath} On invalid derivation path provided.
     */
    public static assertValidPath = (
      path: string,
    ): void => {
      if (!HDService.isValidPath(path)) {
        throw new FailureInvalidDerivationPath(`Invalid derivation path: ${path}`)
      }
    }

    /**
     * @function Swapable.HDService.assertCanModifyLevel()
     * @static
     * @access public
     * @description Helper function to assert whether a derivation path level can be modified.
     * @throws {FailureInvalidDerivationPath} On invalid derivation path level provided.
     */
    public static assertCanModifyLevel = (
      which: DerivationPathLevels
    ): void => {
      const protect = [
        DerivationPathLevels.Purpose,
        DerivationPathLevels.CoinType,
      ]
      if (undefined !== protect.find(type => which === type)) {
        throw new FailureInvalidDerivationPath('Cannot modify a derivation path\'s purpose and coin type levels.')
      }
    }

    /**
     * @function Swapable.HDService.incrementPathLevel()
     * @static
     * @access public
     * @description Helper function to increment a derivation path level.
     * @throws {FailureInvalidDerivationPath} On invalid derivation path or derivation path level provided.
     */
    public static incrementPathLevel = (
      path: string,
      which: DerivationPathLevels = DerivationPathLevels.Account,
      step: number = 1,
    ): string => {

      // make sure derivation path is valid
      HDService.assertValidPath(path)

      // purpose and coin type cannot be changed
      HDService.assertCanModifyLevel(which)

      // read levels and increment 
      const index = which as number
      const parts = path.split('/')
      
      // calculate next index (increment)
      const next = (step <= 1 ? 1 : step) + parseInt(parts[index].replace(/'/, ''))

      // modify affected level only
      return parts.map((level, idx) => {
        if (idx !== index) {
          return level
        }
        return `${next}'`
      }).join('/')
    }

    /**
     * @function Swapable.HDService.decrementPathLevel()
     * @static
     * @access public
     * @description Helper function to decrement a derivation path level.
     * @throws {FailureInvalidDerivationPath} On invalid derivation path or derivation path level provided.
     */
    public static decrementPathLevel = (
      path: string,
      which: DerivationPathLevels = DerivationPathLevels.Account,
      step: number = 1,
    ): string => {
      // make sure derivation path is valid
      HDService.assertValidPath(path)

      // purpose and coin type cannot be changed
      HDService.assertCanModifyLevel(which)

      // read levels and increment 
      const index = which as number
      const parts = path.split('/')

      // calculate next index (decrement)
      let next = parseInt(parts[index].replace(/'/, '')) - (step <= 1 ? 1 : step)
      if (next < 0) next = 0

      // modify affected level only
      return parts.map((level, idx) => {
        if (idx !== index) {
          return level
        }
        return `${next}'`
      }).join('/')
    }

    /**
     * @function Swapable.HDService.getPaths()
     * @static
     * @access public
     * @description Helper function to one or more derivation paths. This
     *              method increments the  `DerivationPathLevels.Account`
     *              derivation path level to find next accounts.
     * @throws {FailureInvalidDerivationPath} On invalid derivation path or derivation path level provided.
     * @throws {FailureInvalidDerivationPath} On invalid derivation path level provided.
     */
    public static getPaths = (
      startPath: string,
      size: number = 1,
    ): string[] => {
      if (size <= 1) {
        return [startPath]
      }

      // iterate for next paths creation
      const paths: string[] = [startPath]
      let current: string = startPath

      while (paths.length < size) {
        const nextPath: string = HDService.incrementPathLevel(current, DerivationPathLevels.Account)

        // move to next
        paths.push(nextPath)
        current = nextPath
      }

      return paths
    }
  }
}
