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
import { MosaicId } from 'symbol-sdk'

// internal dependencies
import {
  Symbol,
} from '../../index'
import { getTestAccount, getTestRegistry, Stubs } from '../mocks/index'

// prepare
const seedHash = 'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4'
const registry = getTestRegistry()
const defaultPoolRegistry = 'TB2IMFLYCQFZC6NZLWVQL26FZN6BNCNBZJP7WJQ'

describe('contracts/Registry --->', () => {
  describe('constructor() should', () => {
    it('use correct pool registry account', () => {
      expect(registry.publicAccount.address.plain()).to.be.equal(defaultPoolRegistry)
    })
  })

  describe('getPools() should', () => {
    it('exist and execute', async () => {
      // - Prepare
      const mockRegistry = sinon.mock(registry)
      const stubGetPools = mockRegistry.expects('getPools').once()

      // - Act
      await registry.getPools()

      // - Assert
      expect(stubGetPools.calledOnce).to.be.true
    })

    it('use correct Reader implementation', () => {
      const c = registry.context
      expect(c.reader).to.be.instanceof(Symbol.Reader)
      expect((c.reader as Symbol.Reader).generationHash).to.be.equal(seedHash)
    })

    it('get correct mosaic metadata', async () => {
      // - Prepare
      const context = registry.context
      const factory = (context.reader as Symbol.Reader).factoryHttp
      const stubMetadata = new Stubs.MetadataRepository('http://localhost:3000')
      const stubRepository = sinon.stub(factory, 'createMetadataRepository').returns(stubMetadata)
      const stubMosaic = new MosaicId('170834A66B95C059')
      const stubMetadataPage = of(new Stubs.Page([new Stubs.Metadata(stubMosaic, 'test', 'value')]))
      const repository = factory.createMetadataRepository()
      const stubbedSearch = sinon.stub(repository, 'search').returns(stubMetadataPage)

      // - Act
      const metadata: Stubs.Page<Stubs.Metadata> = await repository.search({ targetId: stubMosaic }).toPromise()
      const expectMeta: Stubs.Page<Stubs.Metadata> = await stubMetadataPage.toPromise()

      // - Assert
      expect(stubRepository.calledOnce).to.be.true
      expect(stubbedSearch.calledOnce).to.be.true
      expect(metadata.pageSize).to.be.equal(1)
      expect(metadata.data).to.not.be.undefined
      expect(metadata.data.length).to.be.equal(1)
      expect(metadata.data[0].id).to.be.equal(expectMeta.data[0].id);
    })

    it('get correct registry transfers', async () => {
      // - Prepare
      const stubService = new Stubs.TransactionService()
      const stubTransactionPage = of([new Stubs.TransferTransaction(new MosaicId('170834A66B95C059'))])
      const stubRepository = sinon.stub(stubService, 'getIncomingTransfers').returns(stubTransactionPage)

      // - Act
      const transactions: Stubs.TransferTransaction[] = await stubService.getIncomingTransfers(
        getTestAccount('target').address,
        0 // no more than 1 confirmation
      ).toPromise()
      const expectTxes: Stubs.TransferTransaction[] = await stubTransactionPage.toPromise()

      // - Assert
      expect(stubRepository.calledOnce).to.be.true
      expect(transactions).to.not.be.undefined
      expect(transactions.length).to.be.equal(1)

      const transfer: Stubs.TransferTransaction = transactions[0] as Stubs.TransferTransaction
      const expected: Stubs.TransferTransaction = expectTxes[0] as Stubs.TransferTransaction
      expect(transfer.recipientAddress.plain()).to.be.equal(expected.recipientAddress.plain());
      expect(transfer.mosaics.length).to.be.equal(1);
      expect(transfer.mosaics[0].id.toHex()).to.be.equal('170834A66B95C059');
      expect(transfer.mosaics[0].amount.compact()).to.be.equal(1);
    })
  })
})
