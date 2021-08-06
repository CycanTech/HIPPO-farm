import { TokenAmount } from '@cointribute/pancakeswap-sdk-v2'

export default class TransactionHistory {
  tokenAmount: TokenAmount
  readonly date: Date
  readonly status: TRANSACTION_STATUS
  readonly symbol: TRANSACTION_SYMBOLS
  readonly tokenSymbol: string
  readonly transactionType: TRANSACTION_TYPE

  constructor(
    tokenAmount: TokenAmount,
    status: TRANSACTION_STATUS,
    symbol: TRANSACTION_SYMBOLS,
    tokenSymbol: string,
    transactionType: TRANSACTION_TYPE
  ) {
    const date = new Date()

    this.tokenAmount = tokenAmount
    this.transactionType = transactionType
    this.date = date
    this.status = status
    this.tokenSymbol = tokenSymbol
    this.symbol = symbol
  }
}

export enum TRANSACTION_TYPE {
  STAKE,
  UNSTAKE,
  HARVEST_EARNED,
}

export enum TRANSACTION_STATUS {
  SUCCESS,
  FAILED,
}

export enum TRANSACTION_SYMBOLS {
  PLUS,
  MINUS,
}
