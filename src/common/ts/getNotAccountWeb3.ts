import Web3 from 'web3'
import { BSCSCAN_PRC_URL } from '../ts/const'

export default function getNotAccountWeb3(): Web3 {
  return new Web3(BSCSCAN_PRC_URL ? BSCSCAN_PRC_URL : 'https://bsc-dataseed.binance.org')
}
