/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import {
  MosaicId,
  NetworkType,
  PublicAccount,
} from 'symbol-sdk'

// internal dependencies
import { getTestAccount } from './Accounts'
import { Command, CommandOption, Context, Swapable, Symbol, TransactionParameters } from '../../index'

const seedHash = 'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4'

export class FakeMarket extends Swapable.DigitalMarket {
  public fakeGetContext(
    actor: PublicAccount,
    params: TransactionParameters = new TransactionParameters(),
    argv?: CommandOption[]
  ): Context {
    return this.getContext(
      actor,
      params,
      argv
    )
  }

  public fakeGetCommand(
    command: string,
    context: Context,
  ): Command {
    return this.getCommand(
      getTestMarket().identifier,
      command,
      context,
    )
  }
}

export const getTestMarket = (): FakeMarket => {
  return new FakeMarket(
    'SWP:XYM',
    new Symbol.Reader(
      'http://api-01.us-west-1.symboldev.network:3000',
      NetworkType.TEST_NET,
      seedHash,
      1573430400,
      new MosaicId('519FC24B9223E0B4'),
      'DummyNodePublicKey',
    ),
    getTestAccount('target'),
  )
}
