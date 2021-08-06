import axios from 'axios'
import MasterChefAbi from '../abi/MasterChefAbi.json'
import { getContract, formatAmount } from '../common/ts/utils'
import { MASTER_CHEF_ADDRESS, MINING_TOKEN } from '../common/ts/const'
import { Token } from '@cointribute/pancakeswap-sdk-v2'
import getNotAccountWeb3 from '../common/ts/getNotAccountWeb3'

const keys = [
  'GQVQGMKEJ5W5NUR6M3STT8UJKRAJ7S7GEZ',
  'P5MYKB3WAHT2X447QZCEAV87RRV4BYMMMB',
  'YUA2J37Q2P34V9UUNYIIE4AVF37FGUK2A3',
]

let keyIndex = 0

export default async function getAPY(stakeToken: Token, poolPoint: number): Promise<string> {
  const urls = {
    token: `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${MINING_TOKEN.address}&address=${stakeToken.address}&tag=latest&apikey=${keys[keyIndex]}`,
    stakeToken: `https://api.bscscan.com/api?module=stats&action=tokenCsupply&contractaddress=${stakeToken.address}&apikey=${keys[keyIndex]}`,
    staked: `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${stakeToken.address}&address=${MASTER_CHEF_ADDRESS}&tag=latest&apikey=${keys[keyIndex]}`,
  }
  keyIndex < keys.length - 1 ? keyIndex++ : (keyIndex = 0)

  const contract = getContract(MasterChefAbi, MASTER_CHEF_ADDRESS, getNotAccountWeb3())
  const currentEpoch = await contract.methods.getCurrentEpoch().call()
  try {
    const [totalRevenue, tokenNumber, stakeTokenNumber, stakedNumber] = await Promise.all([
      contract.methods.getEpochRewards(currentEpoch).call(),
      axios.get(urls.token),
      axios.get(urls.stakeToken),
      axios.get(urls.staked),
    ])

    const formatdToken = formatAmount(tokenNumber.data.result)
    const formatdStakeTokenNumber = formatAmount(stakeTokenNumber.data.result)
    const formatdStakedNumber = formatAmount(stakedNumber.data.result)
    const revenue = formatAmount(totalRevenue) * poolPoint

    if (!formatdStakedNumber) {
      return '0'
    }

    const PLP = (formatdToken * 2) / formatdStakeTokenNumber
    const APY = (((200 / PLP / formatdStakedNumber) * revenue) / 200) * 365 * 100

    return APY.toFixed(2)
  } catch (error) {
    return '-'
  }
}
