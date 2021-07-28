/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */

// errors
export { FailureCommandExecution } from './src/errors/FailureCommandExecution'
export { FailureEmptyContract } from './src/errors/FailureEmptyContract'
export { FailureInvalidCommand } from './src/errors/FailureInvalidCommand'
export { FailureMissingArgument } from './src/errors/FailureMissingArgument'
export { FailureOperationForbidden } from './src/errors/FailureOperationForbidden'

// models
export { AllowanceResult } from './src/models/AllowanceResult'
export { AssetAmount } from './src/models/AssetAmount'
export { AssetSource } from './src/models/AssetSource'
export { AssetIdentifier } from './src/models/AssetIdentifier'
export { CommandOption } from './src/models/CommandOption'
export { TransactionParameters } from './src/models/TransactionParameters'
export { PoolInfo } from './src/services/PoolService'

// contracts
export { Context } from './src/contracts/Context'
export { Command } from './src/contracts/Command'
export { Service } from './src/contracts/Service'
export { BaseCommand } from './src/contracts/BaseCommand'
export { Market } from './src/contracts/Market'
export { Reader } from './src/contracts/Reader'

// adapters: exports one class `Reader` per blockchain network,
// Adapter for Symbol
import * as Symbol from './src/adapters/Symbol';
export { Symbol }

// Adapter for dHealth
export const dHealth = Symbol

// export open standard namespace `Swapable`
import * as Swapable from './src/Swapable'
export { Swapable }
