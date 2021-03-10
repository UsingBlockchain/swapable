/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

import {EMPTY, Observable} from 'rxjs'
import {concatMap, expand, map, mergeMap, toArray} from 'rxjs/operators'
import {
  AccountRepository,
  Address,
  AggregateTransaction,
  AggregateTransactionInfo,
  ChainRepository,
  MosaicId,
  PlainMessage,
  ReceiptRepository,
  Transaction,
  TransactionGroup,
  TransactionInfo,
  TransactionRepository,
  TransactionService as LibTransactionService,
  TransactionType,
  TransferTransaction,
  UInt64,
  Page,
  ChainInfo,
} from 'symbol-sdk'

/**
 * @class TransactionService
 * @package Swapable
 * @subpackage Services
 * @since v1.0.0
 * @description Class that describes a service around Symbol transactions.
 */
export class TransactionService {

  /**
   * @description The low-level transaction service (Symbol SDK).
   */
  private readonly transactionService: LibTransactionService;

  /**
   * Constructor for TransactionService objects
   *
   * @param {AccountRepository} accountRepository 
   * @param {ChainRepository} chainRepository 
   * @param {TransactionRepository} transactionHttp 
   * @param {ReceiptRepository} receiptHttp 
   * @param {number} pageSize 
   */
  constructor(
    /**
     * @description The Symbol account repository.
     */
    private readonly accountRepository: AccountRepository,

    /**
     * @description The Symbol chain repository.
     */
    private readonly chainRepository: ChainRepository,

    /**
     * @description The Symbol transaction repository.
     */
    private readonly transactionHttp: TransactionRepository,

    /**
     * @description The Symbol receipt repository.
     */
    private readonly receiptHttp: ReceiptRepository,

    /**
     * @description The page size for transaction listings.
     */
    private pageSize: number
  ) {
    this.transactionService = new LibTransactionService(transactionHttp, receiptHttp)
  }

  /**
   * @function Swapable.TransactionService.getTransactionHash()
   * @static
   * @access public
   * @description Gets a transaction's hash. If it is an aggregate transaction,
   *              returns the aggregate transaction hash (merkle root hash).
   *
   * @param transaction Transaction.
   * @returns string | undefined
   */
  public static getTransactionHash(
    transaction: Transaction,
  ): string | undefined {
    const transactionInfo = transaction.transactionInfo;
    let hash;
    if (transactionInfo instanceof AggregateTransactionInfo) {
      hash = transactionInfo.aggregateHash;
    } else if (transactionInfo instanceof TransactionInfo) {
      hash = transactionInfo.hash;
    }
    return hash
  }

  /**
   * @function Swapable.TransactionService.getUnprocessedTransactions()
   * @access public
   * @description Gets the list of transactions pending to be processed.
   *
   * @param   {Address}   address             The address that will be read.
   * @param   {string}    lastTransactionId   (Optional) Resource identifier of the last transaction already processed.
   * @returns Observable <Transaction[]>
   */
  public getUnprocessedTransactions(
    address: Address,
    lastTransactionId?: string,
  ): Observable<Transaction[]> {

    // Keeps only transfers and aggregate transactions starting
    // at offset `lastTransactionId`.
    return this.transactionHttp.search({
      address: address,
      group: TransactionGroup.Confirmed,
      type: [
        TransactionType.TRANSFER,
        TransactionType.AGGREGATE_COMPLETE,
        TransactionType.AGGREGATE_BONDED
      ],
      offset: lastTransactionId,
    }).pipe(
      // Expands to get all transactions pending to be processed
      expand((page: Page<Transaction>) => {
        const transactions = page.data
        if (transactions.length === this.pageSize) {
          return this.transactionHttp.search({
            address: address,
            group: TransactionGroup.Confirmed,
            type: [
              TransactionType.TRANSFER,
              TransactionType.AGGREGATE_COMPLETE,
              TransactionType.AGGREGATE_BONDED
            ],
            offset: lastTransactionId,
          }).toPromise();
        }

        return EMPTY;
      }),
      concatMap((_) => _.data),
      toArray())
  }

  /**
   * @function Swapable.TransactionService.getIncomingTransfers()
   * @access public
   * @description Gets the transactions eligible to be processed as incoming transfers.
   *
   * @param   {Address}   address                 The address that will be read.
   * @param   {number}    requiredConfirmations   Number of blocks before a transaction is considered persistent.
   * @param   {string}    lastTransactionId       (Optional) Resource identifier of the last transaction already processed.
   * @returns Observable <TransferTransaction[]>  A list of unprocessed incoming transfers.
   */
  public getIncomingTransfers(
    address: Address,
    requiredConfirmations: number,
    lastTransactionId?: string,
  ): Observable<TransferTransaction[]> {
    return this.getUnprocessedTransactions(address, lastTransactionId).pipe(
      mergeMap((transactions: Transaction[]) =>
        this.resolveTransactionsAliases(transactions)),
      map((transactions: Transaction[]) =>
        TransactionService.flattenAggregateTransactions(transactions)),
      mergeMap((transactions: Transaction[]) =>
        this.filterTransactionsWithEnoughConfirmations(transactions, requiredConfirmations)),
      map((transactions: Transaction[]) =>
        TransactionService.filterElligibleIncomingTransfers(transactions, address)),
    )
  }

  /**
   * @function Swapable.TransactionService.getOutgoingTransfers()
   * @access public
   * @description Gets the transactions eligible to be processed as outgoing transfers.
   *
   * @param   {Address}   address                 The address that will be read.
   * @param   {number}    requiredConfirmations   Number of blocks before a transaction is considered persistent.
   * @param   {string}    lastTransactionId       (Optional) Resource identifier of the last transaction already processed.
   * @returns Observable <TransferTransaction[]>  A list of unprocessed outgoing transfers.
   */
  public getOutgoingTransfers(
    address: Address,
    requiredConfirmations: number,
    lastTransactionId?: string,
  ): Observable<TransferTransaction[]> {
    return this.getUnprocessedTransactions(address, lastTransactionId).pipe(
      mergeMap((transactions: Transaction[]) =>
        this.resolveTransactionsAliases(transactions)),
      map((transactions: Transaction[]) =>
        TransactionService.flattenAggregateTransactions(transactions)),
      mergeMap((transactions: Transaction[]) =>
        this.filterTransactionsWithEnoughConfirmations(transactions, requiredConfirmations)),
      map((transactions: Transaction[]) =>
        TransactionService.filterElligibleOutgoingTransfers(transactions, address)),
    )
  }

  /**
   * @function Swapable.TransactionService.filterTransactionsWithEnoughConfirmations()
   * @access public
   * @description Given an array of transactions, returns only the ones which have a given
   *              minimum number of confirmations.
   *
   * @param   {Transaction[]}   transactions            List of transactions.
   * @param   {number}          requiredConfirmations   Number of confirmations required.
   * @returns Observable <Transaction[]>
   */
  public filterTransactionsWithEnoughConfirmations(
    transactions: Transaction[],
    requiredConfirmations: number,
  ): Observable<Transaction[]> {
    return this.chainRepository.getChainInfo().pipe(
      // Determine if the transactions have received enough confirmations.
      map((info: ChainInfo) => transactions.filter((transaction) => {
        const currentHeight = info.height;
        const transactionHeight = transaction.transactionInfo!.height;
        return (currentHeight.subtract(transactionHeight)
          .compare(UInt64.fromUint(requiredConfirmations)) >= 0);
      }))
    )
  }

  /**
   * @function Swapable.TransactionService.filterTransactionsWithEnoughConfirmations()
   * @access public
   * @description Given an array of transactions, resolves the aliases behind an announced transaction.
   *
   * @param   {Transaction[]}   transactions   List of transactions to resolve.
   * @returns Observable <Transaction[]>
   */
  public resolveTransactionsAliases(
    transactions: Transaction[],
  ): Observable<Transaction[]> {
    const transactionHashes = transactions.map(
      ((transaction) => transaction.transactionInfo!.hash
    )) as string[]
    return this.transactionService.resolveAliases(transactionHashes)
  }

  /**
   * @function Swapable.TransactionService.flattenAggregateTransactions()
   * @static
   * @access public
   * @description Processes the list of transactions. In case there is an
   *              aggregate transaction, it removes the wrapper to return 
   *              each inner transaction separately.
   *
   * @param   {Transaction[]}   transactions    List of transactions.
   * @returns {Transaction[]}
   */
  public static flattenAggregateTransactions(
    transactions: Transaction[],
  ): Transaction[] {
    const txes: TransferTransaction[] = []
    return txes.concat(transactions.map((transaction) => {
        let flattenTransactions;
        if (transaction instanceof AggregateTransaction) {
            flattenTransactions = transaction.innerTransactions;
        } else {
            flattenTransactions = [transaction];
        }
        return TransactionService.filterTransferTransactions(flattenTransactions);
    }).reduce((prev, it: TransferTransaction[]) => prev.concat(it), []));
  }

  /**
   * @function Swapable.TransactionService.filterTransferTransactions()
   * @static
   * @access public
   * @description Given an array of transactions, returns only the ones
   *              with type TRANSFER.
   *
   * @param   {Transaction[]}   transactions    List of transactions.
   * @returns {TransferTransaction[]}
   */
  public static filterTransferTransactions(
    transactions: Transaction[],
  ): TransferTransaction[] {
    return transactions
      .filter((transaction) => (transaction.type === TransactionType.TRANSFER))
      .map((transaction) => (transaction as TransferTransaction))
  }

  /**
   * @function Swapable.TransactionService.filterElligibleIncomingTransfers()
   * @static
   * @access public
   * @description Given an array of transactions, returns only the ones that
   *              represent _incoming transfers_ in relation to an address.
   *
   * A transaction is elligible when following conditions are both met: 
   * - It has the type TRANSFER.
   * - The recipient address is the correct address.
   * - The message field is not empty.
   *
   * @param   {Transaction[]}   transactions    List of transactions that could be eligible _incoming transfers_.
   * @param   {Address}         recipientAddr   The address considered the "recipient".
   * @returns {TransferTransaction[]}
   */
  public static filterElligibleIncomingTransfers(
    transactions: Transaction[],
    recipientAddr: Address,
  ): TransferTransaction[] {
    return TransactionService.filterTransferTransactions(transactions)
      .filter((transaction) => (
        transaction.recipientAddress instanceof Address
        && transaction.recipientAddress.plain() === recipientAddr.plain()
      ))
      .filter((transaction) => (
        transaction.message instanceof PlainMessage
        && transaction.message.payload.length !== 0),
      )
  }

  /**
   * @function Swapable.TransactionService.filterElligibleOutgoingTransfers()
   * @static
   * @access public
   * @description Given an array of transactions, returns only the ones that
   *              represent _outgoing transfers_ in relation to an address.
   * 
   * A transaction is elligible when following conditions are both met: 
   * - It has the type TRANSFER.
   * - The signer address is the correct address.
   * - The message field is not empty.
   *
   * @param   {Transaction[]}   transactions    List of transactions that could be eligible _outgoing transfers_.
   * @param   {Address}         senderAddress   The address considered the "sender".
   * @returns {TransferTransaction[]}
   */
  public static filterElligibleOutgoingTransfers(
    transactions: Transaction[],
    senderAddress: Address,
  ): TransferTransaction[] {
    return TransactionService.filterTransferTransactions(transactions)
      .filter((transaction) => (
        transaction.signer!.address.equals(senderAddress)
      ))
      .filter((transaction) => (
        transaction.message instanceof PlainMessage
        && transaction.message.payload.length !== 0),
      )
  }
}