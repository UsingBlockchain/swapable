/**
 * This file is part of Swapable shared under LGPL-3.0-only.
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0-only
 */
import { CreatePool as CreatePoolImpl } from './CreatePool'
import { AddLiquidity as AddLiquidityImpl } from './AddLiquidity'
import { RemoveLiquidity as RemoveLiquidityImpl } from './RemoveLiquidity'
import { Swap as SwapImpl } from './Swap'
import { Publish as PublishImpl } from './Publish'

/**
 * @namespace Swapable.PoolCommands
 * @package Swapable
 * @subpackage Commands
 * @since v1.0.0
 * @description Namespace that contains pool command implementations
 */
export namespace PoolCommands {

  // - Exports an alias to the `CreatePool` command implementation
  export class CreatePool extends CreatePoolImpl {}

  // - Exports an alias to the `AddLiquidity` command implementation
  export class AddLiquidity extends AddLiquidityImpl {}

  // - Exports an alias to the `RemoveLiquidity` command implementation
  export class RemoveLiquidity extends RemoveLiquidityImpl {}

  // - Exports an alias to the `Swap` command implementation
  export class Swap extends SwapImpl {}

  // - Exports an alias to the `Publish` command implementation
  export class Publish extends PublishImpl {}

}
