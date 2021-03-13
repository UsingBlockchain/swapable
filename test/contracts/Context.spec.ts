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
import { getTestAccount } from '../mocks/index'
import { CommandOption, Context, Symbol } from '../../index'
import { Deadline, MosaicId } from 'symbol-sdk'
import { TransactionParameters } from '../../src/models/TransactionParameters'

const context = new Context(
  1,
  getTestAccount('operator1'),
  new Symbol.Reader(
    'http://api-01.us-west-1.0941-v1.symboldev.network',
    getTestAccount('operator1').address.networkType,
    'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4',
    1573430400,
    new MosaicId('519FC24B9223E0B4'),
    'DummyNodePublicKey',
  ),
  new Symbol.Signer(),
  new TransactionParameters(
    1573430400,
    Deadline.create(1573430400),
    undefined, // maxFee
  ),
  undefined, // argv
)

const contextWithArgs = new Context(
  1,
  getTestAccount('operator1'),
  new Symbol.Reader(
    'http://api-01.us-west-1.0941-v1.symboldev.network',
    getTestAccount('operator1').address.networkType,
    'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4',
    1573430400,
    new MosaicId('519FC24B9223E0B4'),
    'DummyNodePublicKey',
  ),
  new Symbol.Signer(),
  new TransactionParameters(
    1573430400,
    Deadline.create(1573430400),
    undefined, // maxFee
  ),
  [new CommandOption('identifier', 'id')],
)

describe('contracts/Context --->', () => {
  describe('getInput() should', () => {
    it('use default value given no arguments', () => {
      // act
      const identifier = context.getInput('identifier', 'default')

      // assert
      expect(identifier).to.not.be.undefined
      expect(identifier).to.be.equal('default')
    })

    it('use correct value given argument', () => {
      // act
      const identifier = contextWithArgs.getInput('identifier', 'default')

      // assert
      expect(identifier).to.not.be.undefined
      expect(identifier).to.be.equal('id')
    })
  })
})