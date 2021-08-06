import { Token, ChainId, Percent } from '@cointribute/pancakeswap-sdk-v2'
import JSBI from 'jsbi'

export const CHAIN_ID = process.env.VUE_APP_CHAIN_ID

export const CHAIN_ID_LIST = [CHAIN_ID]

export const BSCSCAN_PRC_URL = process.env.VUE_APP_BSCSCAN_PRC_URL

export const MASTER_CHEF_ADDRESS = '0x29B4C69Aa646f689e54cA324D15730D7617D68ba'

export const MINING_TOKEN = new Token(
  ChainId.MAINNET,
  '0xe6ffa2e574a8bbeb5243d2109b6b11d4a459f88b',
  18,
  'HIP'
)

export const USDT = new Token(
  ChainId.MAINNET,
  '0x55d398326f99059ff775485246999027b3197955',
  18,
  'USDT'
)

export const WRAPPED_BNB = new Token(
  ChainId.MAINNET,
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  18,
  'WBNB'
)

export const ZERO = JSBI.BigInt('0')

export const ONE_BIPS = new Percent('1', '1000')

export const MAX_BIPS = new Percent('100', '100')
