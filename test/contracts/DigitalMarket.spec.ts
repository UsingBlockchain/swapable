/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import * as sinon from 'sinon'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { of } from 'rxjs'
import { AccountInfo } from 'symbol-sdk'

// internal dependencies
import {
  BaseCommand,
  CommandOption,
  FailureInvalidCommand,
  Swapable,
  Symbol,
  TransactionParameters,
} from '../../index'
import { getTestAccount, getTestAccountInfo, getTestMarket, Stubs } from '../mocks/index'

// prepare
const seedHash = 'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4'
const market = getTestMarket()
const target = getTestAccount('target')
const defaultPoolTarget = 'TB2IMFLYCQFZC6NZLWVQL26FZN6BNCNBZJP7WJQ'

describe('contracts/DigitalMarket --->', () => {
  describe('constructor() should', () => {
    it('derive correct pool target account', () => {
      expect(market.target.address.plain()).to.be.equal(defaultPoolTarget)
    })

    it('use correct asset source', () => {
      expect(market.source.source).to.be.equal(seedHash)
    })
  })

  describe('identifier() should', () => {
    it('derive correct pool shares identifier', () => {
      expect(market.identifier.id).to.be.equal('91a1d506')
      expect(market.identifier.target.address.plain()).to.be.equal(defaultPoolTarget)
    })
  })

  describe('getContext() should', () => {
    it('use correct Revision', () => {
      const c = market.fakeGetContext(target)
      expect(c.revision).to.be.equal(Swapable.Revision)
    })

    it('use correct Reader implementation', () => {
      const c = market.fakeGetContext(target)
      expect(c.reader).to.be.instanceof(Symbol.Reader)
      expect((c.reader as Symbol.Reader).generationHash).to.be.equal(seedHash)
    })

    it('permit overwrite of transaction parameters', () => {
      const c = market.fakeGetContext(target, new TransactionParameters(1234))
      expect(c.parameters).to.be.instanceof(TransactionParameters)
      expect(c.parameters.epochAjustment).to.be.equal(1234)
    })

    it('permit overwrite of contract options', () => {
      const c = market.fakeGetContext(target, new TransactionParameters(), [
        new CommandOption('dummy', 'value')
      ])
      expect(c.getInput('dummy', null)).to.not.be.null
      expect(c.getInput('dummy', null)).to.be.equal('value')
    })
  })

  describe('getCommand() should', () => {
    it ('throw an error on unknown automated pool command', () => {
      const context = market.fakeGetContext(target)
      expect(() => {
        const command = market.fakeGetCommand('unknown', context)
      }).to.throw(FailureInvalidCommand)
    })

    it('use correct Context for execution', () => {
      const context = market.fakeGetContext(target)
      const command = market.fakeGetCommand('CreatePool', context)
      expect(command.context.actor.publicKey).to.be.equal(target.publicKey)
      expect(command.context.revision).to.be.equal(Swapable.Revision)
    })

    it('use correct automated pool command', () => {
      const context = market.fakeGetContext(target)
      const command = market.fakeGetCommand('CreatePool', context)
      expect(command).to.be.instanceof(BaseCommand)
      expect(command.name).to.be.equal('CreatePool')
    })
  })

  describe('synchronize() should', () => {
    it('exist and execute', async () => {
      // - Prepare
      const mockMarket = sinon.mock(market)
      const stubSynchronize = mockMarket.expects('synchronize').once()

      // - Act
      await market.synchronize()

      // - Assert
      expect(stubSynchronize.calledOnce).to.be.true
    })

    it('get correct mosaic information', async () => {
      // - Prepare
      const context = market.fakeGetContext(target)
      const factory = (context.reader as Symbol.Reader).factoryHttp
      const stubMosaics = new Stubs.MosaicRepository('http://localhost:3000')
      const stubRepository = sinon.stub(factory, 'createMosaicRepository').returns(stubMosaics)
      const stubMosaicInfo = of(new Stubs.MosaicInfo(market.identifier.toMosaicId()))
      const repository = factory.createMosaicRepository()
      const stubGetMosaic = sinon.stub(repository, 'getMosaic').returns(stubMosaicInfo)

      // - Act
      const mosaicId: Stubs.MosaicInfo = await repository.getMosaic(market.identifier.toMosaicId()).toPromise()
      const expectId: Stubs.MosaicInfo = await stubMosaicInfo.toPromise()

      // - Assert
      expect(stubRepository.calledOnce).to.be.true
      expect(stubGetMosaic.calledOnce).to.be.true
      expect(mosaicId.id.toHex()).to.be.equal(expectId.id.toHex())
    })

    it('get correct account information', async () => {
      // - Prepare
      const context = market.fakeGetContext(target)
      const factory = (context.reader as Symbol.Reader).factoryHttp
      const stubAccounts = new Stubs.AccountRepository('http://localhost:3000')
      const stubRepository = sinon.stub(factory, 'createAccountRepository').returns(stubAccounts)
      const stubAccountInfo = of(getTestAccountInfo('target'))
      const repository = factory.createAccountRepository()
      const stubGetAccountInfo = sinon.stub(repository, 'getAccountInfo').returns(stubAccountInfo)

      // - Act
      const accountInfo: AccountInfo = await repository.getAccountInfo(target.address).toPromise()

      // - Assert
      expect(stubRepository.calledOnce).to.be.true
      expect(stubGetAccountInfo.calledOnce).to.be.true
      expect(accountInfo.address.plain()).to.be.equal(target.address.plain())
    })
  })
})
