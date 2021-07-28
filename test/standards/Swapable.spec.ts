/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import { expect } from 'chai'
import { describe, it } from 'mocha'

// internal dependencies
import { Swapable } from '../../index'

describe('Swapable --->', () => {
  it('Revision should be 2', () => {
    expect(Swapable.Revision).to.be.equal(2)
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

    it('export contract Publish', () => {
      expect('Publish' in Swapable.AssetCommands).to.be.true
    })
  })
})
