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
import { MosaicId, NetworkType } from 'symbol-sdk'

// internal dependencies
import { getTestMnemonic } from '../mocks/index'
import { Swapable, Symbol } from '../../index'

// prepare
const mnemonic = getTestMnemonic()
const token = new Swapable.DigitalMarket(
  'SWP:XYM',
  new Symbol.Reader(
    'http://api-01.us-west-1.symboldev.network:3000',
    NetworkType.TEST_NET,
    'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4',
    1573430400,
    new MosaicId('519FC24B9223E0B4'),
    'DummyNodePublicKey',
  ),
  new Symbol.Signer(),
  mnemonic,
)
const defaultPoolTarget = 'TCS5GSPGMCTGTI46SSZIBZMRVTLM4BDQ7MRXAYI' // m/44'/4343'/0'/0'/0'

describe('Swapable Standard --->', () => {
  it('Revision should be 1', () => {
    // assert
    expect(Swapable.Revision).to.be.equal(1)
  })

  it('Should export AutomatedPool class', () => {
    expect(Swapable.AutomatedPool).not.to.be.undefined
  })

  it('Should export DigitalMarket class', () => {
    expect(Swapable.DigitalMarket).not.to.be.undefined
  })

  describe('constructor() should', () => {
    it('derive correct pool target account', () => {
      // assert
      expect(token.target.address.plain()).to.be.equal(defaultPoolTarget)
    })
  })
})
