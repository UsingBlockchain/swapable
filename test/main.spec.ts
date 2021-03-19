/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import {expect} from 'chai'
import {describe, it} from 'mocha'

// internal dependencies
import * as Lib from '../index'

describe('main should', () => {
  it('export Swapable.AutomatedPool', () => {
    expect(Lib.Swapable.AutomatedPool).not.to.be.undefined
  })
  it('export Swapable.DigitalMarket', () => {
    expect(Lib.Swapable.DigitalMarket).not.to.be.undefined
  })
})
