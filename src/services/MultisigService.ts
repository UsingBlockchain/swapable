/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import {
  MultisigAccountGraphInfo,
  MultisigAccountInfo,
} from 'symbol-sdk'

// internal dependencies
import { Service } from '../contracts/Service'

/**
 * @class MultisigService
 * @package Swapable
 * @subpackage Services
 * @since v1.0.0
 * @description Class that describes a service around multi-signature accounts.
 */
export class MultisigService extends Service {
  /**
   * @function Swapable.MultisigService.getMultisigAccountInfoFromGraph()
   * @static
   * @access public
   * @description Helper function to reduce a multi-signature graph to an
   *              array of multi-signature account information.
   *
   * @param {MultisigAccountGraphInfo} graph 
   * @return {MultisigAccountInfo[]}
   */
  public static getMultisigAccountInfoFromGraph(
    graph: MultisigAccountGraphInfo,
  ): MultisigAccountInfo[] {
    // get addresses
    const infos = [...graph.multisigEntries.keys()]
      .sort((a, b) => b - a) // sort from top to bottom
      .map((key) => graph.multisigEntries.get(key) || [])
      .filter((x) => x.length > 0)

    // flatten output
    return infos.reduce((
      prev: MultisigAccountInfo[],
      it: MultisigAccountInfo[]) => [...it]
    )
  }
}
