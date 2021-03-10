/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

// commands
import { CreatePool as CreatePoolImpl } from './commands/CreatePool'

export namespace Swapable {
  /**
   * @class Swapable.CreatePool
   * @package interfaces
   * @since v0.6.0
   * @description Class that describes a token command for creating Swapable compliant tokens.
   */
  export class CreatePool extends CreatePoolImpl {}
}
