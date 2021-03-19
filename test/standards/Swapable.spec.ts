/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import { expect } from 'chai'
import { describe, it } from 'mocha'

// internal dependencies
import { Swapable } from '../../index'

describe('Swapable --->', () => {
  it('Revision should be 1', () => {
    expect(Swapable.Revision).to.be.equal(1)
  })

  describe('AssetCommands should', () => {
    it('export contract CreatePool', () => {
      expect('CreatePool' in Swapable.AssetCommands).to.be.true
    })

    it('export contract AddLiquidity', () => {
      expect('AddLiquidity' in Swapable.AssetCommands).to.be.true
    })

    it('export contract RemoveLiquidity', () => {
      expect('RemoveLiquidity' in Swapable.AssetCommands).to.be.true
    })

    it('export contract Swap', () => {
      expect('Swap' in Swapable.AssetCommands).to.be.true
    })
  })
})
