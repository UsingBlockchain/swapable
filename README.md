# Swapable: Automated Liquidity Pools

[![npm version](https://badge.fury.io/js/swapable.svg)](https://badge.fury.io/js/swapable)
[![Build Status](https://travis-ci.com/usingblockchain/swapable.svg?branch=main)](https://travis-ci.com/usingblockchain/swapable)

*The author of this package cannot be held responsible for any loss of money or any malintentioned usage forms of this package. Please use this package with caution.*

This repository contains the source code for **swapable**, a peer-to-peer automated liquidity pool which enables smart **digital markets**.

## Installation

`npm install swapable`

## Usage

:warning: The following example usage for the `swapable` library is subject to change.
:warning: This command execution creates at least one- or more than one - network-wide
**account restriction**. Restrictions can potentially lock you out of your account, so
please use this only with caution and only if you understand the risks.

```javascript
import { AggregateTransaction, PublicAccount, SignedTransaction } from 'symbol-sdk'
import { MnemonicPassPhrase } from 'symbol-hd-wallets'
import { Swapable, NetworkConfig, TransactionParameters } from 'swapable'
import { TransactionURI } from 'symbol-uri-scheme'

// :warning: The following settings are network specific and may need changes
const transactionParams = new TransactionParameters(
  1573430400,
  Deadline.create(1573430400),
  750000, // maxFee
)

// :warning: You should create separate backups of
// providers and swapable assets pass phrases.
const assetKeys = MnemonicPassPhrase.createRandom() // backup the resulting 24-words safely!

// :warning: It is recommended to create provider
// keys offline and using a separate device.
const provider = new PublicAccount('PUBLIC_KEY_PROVIDER', 'ADDRESS_PROVIDER')

// initialize Swapable library
const reader = new Symbol.Reader(...)
const signer = new Symbol.Signer() 
const swapable = new Swapable.AutomatedPool(
  'SWP:XYM',
  reader,
  signer,
  assetKeys,
)

// offline creation of the `CreatePool` contract
const poolId = swapable.create(
  swapable.getTarget().publicAccount, // actor
  provider, // liquidity provider
  new AssetAmount(Symbol_Testnet_SWP, 10),
  new AssetAmount(Symbol_Testnet_XYM, 10),
  transactionParams,
)

// get the transaction URI for `CreatePool` execution
const resultURI: TransactionURI = swapable.result

// It is important to denote that given the **aggregate** nature of digital
// contracts, multiple parties MAY be involved in the transaction and
// it is therefor required to issue a HashLockTransaction before announcing
// the aggregate bonded transaction that represents the contract.

// :warning: It is recommended to sign the resulting transactions
// using a hardware wallet rather than any type of software generated
// wallets.
```

## Donations / Pot de vin

Donations can also be made with cryptocurrencies and will be used for running the project!

    NEM      (XEM):     NB72EM6TTSX72O47T3GQFL345AB5WYKIDODKPPYW
    Symbol   (XYM):     NDQALDK4XWLOUYKPE7RDEWUI25YNRQ7VCGXMPCI
    Ethereum (ETH):     0x7a846fd5Daa4b904caF7C59f866bb906153305D2
    Bitcoin  (BTC):     3EVqgUqYFRYbf9RjhyjBgKXcEwAQxhaf6o

## Sponsor us

| Platform | Sponsor Link |
| --- | --- |
| Paypal | [https://paypal.me/usingblockchainltd](https://paypal.me/usingblockchainltd) |
| Patreon | [https://patreon.com/usingblockchainltd](https://patreon.com/usingblockchainltd) |
| Github | [https://github.com/sponsors/UsingBlockchain](https://github.com/sponsors/UsingBlockchain) |

## Credits

| Name | Contributions |
| --- | --- |
| Using Blockchain Ltd (@UsingBlockchain) <info@using-blockchain.org> | Product Owner |
| Grégory Saive (@eVias) | Lead Engineering |

## License

Copyright 2020-2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom, All rights reserved.

Licensed under the [AGPL v3 License](LICENSE).
