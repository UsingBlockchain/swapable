/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

// errors
export { FailureCommandExecution } from './src/errors/FailureCommandExecution'
export { FailureEmptyContract } from './src/errors/FailureEmptyContract'
export { FailureInvalidCommand } from './src/errors/FailureInvalidCommand'
export { FailureInvalidDerivationPath } from './src/errors/FailureInvalidDerivationPath'
export { FailureMissingArgument } from './src/errors/FailureMissingArgument'
export { FailureOperationForbidden } from './src/errors/FailureOperationForbidden'

// models
export { AllowanceResult } from './src/models/AllowanceResult'
export { AssetAmount } from './src/models/AssetAmount'
export { AssetSource } from './src/models/AssetSource'
export { AssetIdentifier } from './src/models/AssetIdentifier'
export { CommandOption } from './src/models/CommandOption'
export { TransactionParameters } from './src/models/TransactionParameters'

// contracts
export { Context } from './src/contracts/Context'
export { Command } from './src/contracts/Command'
export { Service } from './src/contracts/Service'
export { BaseCommand } from './src/contracts/BaseCommand'
export { Market } from './src/contracts/Market'
export { Reader } from './src/contracts/Reader'
export { KeyProvider } from './src/contracts/KeyProvider'

// adapters: exports one class `Reader`, one class `Signer`,
// and one class `Accountable` per each blockchain adapter.
import * as Symbol from './src/adapters/Symbol';
export { Symbol }

// export open standard namespace `Swapable`
import * as Swapable from './src/standards/Swapable'
export { Swapable }
