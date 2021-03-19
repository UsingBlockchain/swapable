/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import {
  Account,
  AccountInfo,
  AccountType,
  NetworkType,
  PublicAccount,
  SupplementalPublicKeys,
  UInt64,
} from 'symbol-sdk'
import { MnemonicPassPhrase } from 'symbol-hd-wallets'

type TestAccountType = {
  [name: string]: {
    networkType: NetworkType,
    privateKey: string
  }
}

const TEST_ACCOUNTS: TestAccountType = {
  "target": {
    networkType: NetworkType.MIJIN_TEST,
    // TCS5GSPGMCTGTI46SSZIBZMRVTLM4BDQ7MRXAYI
    privateKey: '27002B109810E4C25E8E6AE964FAF129CC3BFD1A95CB99062E0205060041D0C9'},
  "operator1": {
    networkType: NetworkType.TEST_NET,
    privateKey: '803040D4A33983C4B233C6C2054A24B9C655E8CAC6C06AECCED56B8FE424FF2B'},
  "operator2": {
    networkType: NetworkType.MIJIN_TEST,
    privateKey: '803040D4A33983C4B233C6C2054A24B9C655E8CAC6C06AECCED56B8FE424FF2B'},
  "operator3": {
    networkType: NetworkType.MIJIN_TEST,
    privateKey: '8472FA74A64A97C85F0A285299D9FD2D44D71CB5698FE9C7E88C33001F9DD83F'},
  "random1": {
    networkType: NetworkType.MIJIN_TEST,
    privateKey: 'CAD57FEC0C7F2106AD8A6203DA67EE675A1A3C232C676945306448DF5B4124F8'},
  "random2": {
    networkType: NetworkType.MIJIN_TEST,
    privateKey: '72B08ACF80558B285EADA206BB1226A44038C65AC4649108B2284591641657B5'},
}

export const getTestAccount = (name: string): PublicAccount => {
  if (!TEST_ACCOUNTS.hasOwnProperty(name)) {
    throw new Error('Test account with name: ' + name + ' could not be found in test/mocks/accounts.ts')
  }

  const spec = TEST_ACCOUNTS[name]
  return Account.createFromPrivateKey(spec.privateKey, spec.networkType).publicAccount
}

export const getTestMnemonic = () : MnemonicPassPhrase => {
  return new MnemonicPassPhrase([
    'torch', 'label', 'system', 'hungry', 'honey', 'endorse',
    'knock', 'marine', 'orange', 'junk', 'major', 'double',
    'early', 'runway', 'maximum', 'mother', 'shove', 'stamp',
    'behave', 'already', 'entry', 'west', 'swear', 'fortune',
  ].join(' '))
}

export const getTestAccountInfo = (name: string): AccountInfo => {
  const account = getTestAccount(name)
  return new AccountInfo(
    1,
    '1',
    account.address,
    UInt64.fromUint(1),
    account.publicKey,
    UInt64.fromUint(1),
    AccountType.Main,
    new SupplementalPublicKeys(),
    [],
    [],
    UInt64.fromUint(1),
    UInt64.fromUint(1)
  )
}
