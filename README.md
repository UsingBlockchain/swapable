<p align="center"><img src="https://swapable.symbol.ninja/logo-swapable.png" width="192"></p>

# Swapable: Automated Liquidity Pools

[![npm-badge][npm-badge]][npm-url]
[![size-badge][size-badge]][npm-url]
[![dl-badge][dl-badge]][npm-url]
[![Build Status](https://travis-ci.com/UsingBlockchain/symbol-taxonomy.svg?branch=main)](https://travis-ci.com/UsingBlockchain/symbol-taxonomy)

This repository contains the source code for **swapable**, an open standard for peer-to-peer automated liquidity pools on top of Symbol from NEM, and compatible networks.

This library empowers the creation and operations of **automated liquidity pools** using Symbol from NEM and compatible networks.

- [Reference documentation][ref-docs]
- [Introduction](#introduction)
- [Contracts found here](#contracts-found-here)
- [Installation](#installation)
- [Sponsor Us](#sponsor-us)
- [Disclaimer](#disclaimer)
- [Licensing](#license)

## Introduction

This library empowers the creation and operations of automated liquidity pools using Symbol from NEM and compatible networks.

Swapable assets consist in combining two cryptocurrencies in a liquidity pool to define an invariant `k` using a constant product formula of: `x * y = k`  where `x` and `y` represent the cryptocurrencies that are paired in said liquidity pool. The shares of liquidity providers are determined with another asset that we call the **pool shares mosaic** and which is issued at the time of creation of a liquidity pool, i.e. each liquidity pool will have its own pool shares mosaic.

A swapable asset may be paired with any other cryptocurrency provided that they reside on the same blockchain network.

Liquidity providers add liquidity into pools and Traders can swap currencies. A fee is added to each trade at the rate of 0.30% which are then added to token reserves. Providers can withdraw their shares of the total reserve at any time.

When liquidity is added by a provider, they will be assigned some **Pool Shares**. Those shares can then be burned at any time by providers in order to take back their part of pooled assets.

An automated liquidity pool is represented by the following properties:

- **A target account**: Consists of a public account which holds the funds of said pool. This account SHOULD be converted to a multi-signature account, i.e cosignatories can be the operators of a DAO (see @ubcdigital/governable).

- **A pool shares mosaic**: Consists of a digital asset that is created only for the purpose of keeping track liquidity provider shares in pools. These assets can be burned for pooled assets at any time but are not exchangeable for other cryptocurrencies. Using Symbol from NEM, this asset is represented by a **non-transferrable** mosaic.

## Contracts found here

| Contract Name | Description |
| --- | --- |
| **CreatePool** | Contract for *creating* a new liquidity pool. This contract is typically executed by liquidity providers and require the input of two different cryptocurrencies marked `x` and `y` which form the liquidity pool, a.k.a the market pair. |
| **AddLiquidity** | Contract for *adding liquidity* to an already existing liquidity pool. This contract is typically executed by liquidity providers and requires the input of two cryptocurrencies that have previously been paired in a liquidity pool with the `CreatePool` contract. |
| **RemoveLiquidity** | Contract for *removing liquidity* from an already existing liquidity pool. This contract is typically executed by liquidity providers and requires the input of two cryptocurrencies that have previously been paired in a liquidity pool with the `CreatePool` contract. |
| **Swap** | Contract for *swapping currencies*. This contract is typically executed by traders and requires the input of one cryptocurrency and one output denominator. Prior to the execution of *swaps* between `x` and `y`, a liquidity pool must exist that provides liquidity for the market pair `x:y`, i.e. using the `CreatePool` contract. |

## Installation

`npm i -g @ubcdigital/swapable`

## Sponsor us

| Platform | Sponsor Link |
| --- | --- |
| Paypal | [https://paypal.me/usingblockchainltd](https://paypal.me/usingblockchainltd) |
| Patreon | [https://patreon.com/usingblockchainltd](https://patreon.com/usingblockchainltd) |
| Github | [https://github.com/sponsors/UsingBlockchain](https://github.com/sponsors/UsingBlockchain) |
| :coffee: :coffee: :coffee: | [https://www.buymeacoffee.com/UBCDigital](https://www.buymeacoffee.com/UBCDigital) |

This project is sponsored by [UBC Digital Magazine][mag-url].

## Disclaimer

  *The author of this package cannot be held responsible for any loss of money or any malintentioned usage forms of this package. Please use this package with caution.*

  *Our software contains links to the websites of third parties (“external links”). As the content of these websites is not under our control, we cannot assume any liability for such external content. In all cases, the provider of information of the linked websites is liable for the content and accuracy of the information provided. At the point in time when the links were placed, no infringements of the law were recognisable to us..*

## License

Copyright 2020-2021 [Using Blockchain Ltd][ref-ltd], Reg No.: 12658136, United Kingdom, All rights reserved.

Licensed under the [LGPL v3.0](LICENSE)

[ref-docs]: https://swapable.symbol.ninja/
[ref-ltd]: https://using-blockchain.org
[mag-url]: https://ubc.digital
[npm-url]: https://www.npmjs.com/package/@ubcdigital/swapable
[npm-badge]: https://img.shields.io/npm/v/@ubcdigital/swapable
[size-badge]: https://img.shields.io/bundlephobia/min/@ubcdigital/swapable
[dl-badge]: https://img.shields.io/npm/dt/@ubcdigital/swapable
