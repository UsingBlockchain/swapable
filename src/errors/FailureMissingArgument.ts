/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
// internal dependencies
import { FailureCommandExecution } from './FailureCommandExecution'

/**
 * @class FailureMissingArgument
 * @package Swapable
 * @subpackage Errors
 * @since v1.0.0
 * @description The execution context is missing a required argument.
 */
export class FailureMissingArgument extends FailureCommandExecution {}
