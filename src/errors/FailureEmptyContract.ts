/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

// internal dependencies
import { FailureCommandExecution } from './FailureCommandExecution'

/**
 * @class FailureEmptyContract
 * @package Swapable
 * @subpackage Errors
 * @since v1.0.0
 * @description The resulting digital contract is invalid (empty).
 */
export class FailureEmptyContract extends FailureCommandExecution {}
