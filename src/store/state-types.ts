import TransactionHistory from '@/common/ts/TransactionHistory'
import { Token, TokenAmount } from '@cointribute/pancakeswap-sdk-v2'

export interface State {
  userInfo: UserInfo
  pools: PoolInfo[]
  historys: TransactionHistory[]
  APYS: { [poolId: number]: string }
  isLoadingPools: boolean
  showWalletModel: boolean
  currentPool?: PoolInfo
}

export interface UserInfo {
  account?: string
}

export interface PoolInfo {
  poolId: number
  allocPoint: number
  token: Token
  miningToken: Token
  poolType: POOL_TYPE
  tokenSymbol: string
  poolStakedTokenAmount: TokenAmount
  currencys: [Token, Token] | undefined
  poolShare?: string
  stakedAmount?: TokenAmount
  earningsAmount?: TokenAmount
  earningsBalanceAmount?: TokenAmount
  stakeTokenBalanceAmount?: TokenAmount
}

export enum POOL_TYPE {
  LP_TOKEN = '1',
  SINGLE_TOKEN = '2',
  THOR_TOKEN = '3',
}
